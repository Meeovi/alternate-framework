<template>
    <Lightgallery
        v-if="normalizedItems.length"
        :settings="gallerySettings"
        :onInit="onInit"
        :onBeforeSlide="onBeforeSlide"
    >
        <a
            v-for="(item, index) in normalizedItems"
            :key="item.id ?? index"
            class="gallery-item"
            :data-lg-size="item.size"
            :data-src="item.src"
            :data-sub-html="item.subHtml"
            :data-video="item.video ? stringifyVideo(item.video) : undefined"
            :data-poster="item.poster"
        >
            <img
                class="img-responsive"
                :src="item.thumb || item.poster || item.src"
                :alt="item.alt || ''"
            >
        </a>
    </Lightgallery>
    <div v-else class="gallery-empty">
        <slot name="empty">{{ emptyText }}</slot>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Lightgallery from 'lightgallery/vue';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';

type GalleryVideoSource = {
    src: string;
    type?: string;
};

type GalleryVideo = {
    source: GalleryVideoSource[];
    attributes?: Record<string, unknown>;
};

type GalleryItem = {
    id?: string | number;
    src?: string;
    thumb?: string;
    poster?: string;
    alt?: string;
    size?: string;
    subHtml?: string;
    video?: GalleryVideo;
};

const props = withDefaults(defineProps<{
    items?: GalleryItem[];
    rawItems?: unknown[];
    itemMapper?: (raw: unknown, index: number) => GalleryItem;
    settings?: Record<string, unknown>;
    emptyText?: string;
}>(), {
    items: () => [],
    rawItems: () => [],
    itemMapper: undefined,
    settings: () => ({}),
    emptyText: 'No gallery items available.',
});

const emit = defineEmits<{
    (e: 'init', detail: unknown): void;
    (e: 'before-slide', detail: unknown): void;
}>();

const plugins = [lgZoom, lgVideo];

const gallerySettings = computed(() => ({
    speed: 500,
    plugins,
    ...props.settings,
}));

const normalizedItems = computed<GalleryItem[]>(() => {
    const sourceItems = props.items.length
        ? props.items
        : props.rawItems.map((raw, index) => {
            return props.itemMapper ? props.itemMapper(raw, index) : normalizeRawItem(raw, index);
        });

    return sourceItems
        .map((item) => {
            const size = item.size || '';
            return {
                ...item,
                size,
            };
        })
        .filter((item) => Boolean(item.src || item.video));
});

function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
    for (const key of keys) {
        const value = obj[key];
        if (typeof value === 'string' && value.trim()) {
            return value;
        }
    }
    return undefined;
}

function pickNumber(obj: Record<string, unknown>, keys: string[]): number | undefined {
    for (const key of keys) {
        const value = obj[key];
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
    }
    return undefined;
}

function normalizeRawItem(raw: unknown, index: number): GalleryItem {
    if (!raw || typeof raw !== 'object') {
        return {};
    }

    const source = raw as Record<string, unknown>;
    const src = pickString(source, ['src', 'url', 'full', 'fullUrl', 'original', 'originalUrl']);
    const thumb = pickString(source, ['thumb', 'thumbnail', 'preview', 'previewUrl', 'small', 'smallUrl']);
    const poster = pickString(source, ['poster', 'posterUrl', 'videoPoster']);
    const alt = pickString(source, ['alt', 'title', 'name']);
    const subHtml = pickString(source, ['subHtml', 'captionHtml', 'caption', 'description']);
    const id = (source.id as string | number | undefined) ?? index;

    const width = pickNumber(source, ['width', 'w']);
    const height = pickNumber(source, ['height', 'h']);
    const size = width && height ? `${width}-${height}` : '';

    let video: GalleryVideo | undefined;
    const videoUrl = pickString(source, ['video', 'videoUrl', 'mp4Url']);
    if (videoUrl) {
        video = {
            source: [{ src: videoUrl, type: 'video/mp4' }],
            attributes: { preload: false, controls: true },
        };
    }
    else if (source.video && typeof source.video === 'object') {
        video = source.video as GalleryVideo;
    }

    return {
        id,
        src,
        thumb,
        poster,
        alt,
        size,
        subHtml,
        video,
    };
}

function stringifyVideo(video: GalleryVideo): string {
    return JSON.stringify(video);
}

function onInit(detail: unknown): void {
    emit('init', detail);
}

function onBeforeSlide(detail: unknown): void {
    emit('before-slide', detail);
}
</script>

<style scoped>
@import 'lightgallery/css/lightgallery.css';
@import 'lightgallery/css/lg-zoom.css';
@import 'lightgallery/css/lg-video.css';

.gallery-item {
    margin: 5px;
}

.img-responsive {
    max-width: 100%;
    height: auto;
}

.gallery-empty {
    padding: 1rem;
    color: #666;
}
</style>