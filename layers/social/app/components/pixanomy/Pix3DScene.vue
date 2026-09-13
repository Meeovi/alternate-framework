<template>
  <primitive v-if="model" :object="model" />
</template>

<script setup lang="ts">
import { shallowRef, markRaw, ref, onMounted, onBeforeUnmount, watch, toValue } from 'vue'
import { Box3, Vector3, PMREMGenerator } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useTres, useLoop } from '#imports'

// Renders one glTF/glb model inside the parent <TresCanvas>. Only mounts on
// the client (TresCanvas.server.vue renders an empty <span> with no slot),
// so the three.js example loaders are never instantiated during SSR.
const props = defineProps<{ url: string }>()
const emit = defineEmits<{ status: ['loading' | 'ready' | 'error'] }>()

const model = shallowRef<any>(null)
const loaded = ref(false)

const { scene, camera, renderer, invalidate } = useTres()
const { onBeforeRender } = useLoop()

let controls: any = null
let envSetup = false
let envTexture: any = null
let framed = false
let destroyed = false
let readyFallback: ReturnType<typeof setTimeout> | null = null
let offLoop: (() => void) | null = null

function markReady() {
  if (destroyed) return
  if (readyFallback) {
    clearTimeout(readyFallback)
    readyFallback = null
  }
  emit('status', 'ready')
}

// The declarative <TresPerspectiveCamera> sibling registers a tick after
// this child mounts, so the active camera / renderer aren't readable in
// onMounted — react to them instead. Set up OrbitControls once, then frame
// the model to fit as soon as both the camera and the model exist.
watch(
  [() => toValue(camera), () => toValue(renderer), loaded],
  ([cam, gl]) => {
    if (destroyed || !cam || !gl?.domElement) return
    if (!controls) {
      controls = new OrbitControls(cam, gl.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.08
    }
    // Neutral image-based lighting so glTF PBR materials (metal/rough)
    // aren't rendered black. RoomEnvironment needs no asset file.
    if (!envSetup) {
      const sc = toValue(scene)
      if (sc) {
        try {
          const pmrem = new PMREMGenerator(gl)
          envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
          sc.environment = envTexture
          pmrem.dispose()
        } catch (e) {
          console.warn('[Pix3DScene] environment map setup failed', e)
        }
        envSetup = true
      }
    }
    if (loaded.value && model.value && !framed) {
      frameToFit(model.value, cam)
      framed = true
      invalidate?.()
      markReady()
    }
  },
  { immediate: true },
)

function frameToFit(obj: any, cam: any) {
  const box = new Box3().setFromObject(obj)
  const size = box.getSize(new Vector3())
  const center = box.getCenter(new Vector3())
  // Recenter the model on the origin so OrbitControls orbits its middle.
  obj.position.sub(center)

  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const dist = maxDim * 2.4
  cam.position.set(dist, dist * 0.75, dist)
  cam.near = maxDim / 100
  cam.far = maxDim * 100
  cam.lookAt(0, 0, 0)
  cam.updateProjectionMatrix()

  if (controls) {
    controls.target.set(0, 0, 0)
    controls.maxDistance = maxDim * 20
    controls.minDistance = maxDim * 0.1
    controls.update()
  }
}

onMounted(() => {
  emit('status', 'loading')
  // Belt-and-braces: if the camera watch never fires (it always should),
  // still clear the loading overlay shortly after the model arrives.
  new GLTFLoader().load(
    props.url,
    (gltf: any) => {
      if (destroyed) return
      model.value = markRaw(gltf.scene)
      loaded.value = true
      readyFallback = setTimeout(markReady, 800)
    },
    undefined,
    (err: unknown) => {
      console.error('[Pix3DScene] failed to load model', err)
      emit('status', 'error')
    },
  )
})

const loopHandle = onBeforeRender(() => {
  controls?.update()
})
offLoop = typeof loopHandle === 'function' ? loopHandle : (loopHandle?.off ?? null)

onBeforeUnmount(() => {
  destroyed = true
  if (readyFallback) clearTimeout(readyFallback)
  offLoop?.()
  offLoop = null
  controls?.dispose?.()
  controls = null
  const sc = toValue(scene)
  if (sc && sc.environment === envTexture) sc.environment = null
  envTexture?.dispose?.()
  envTexture = null
  // Release GPU memory — the loader allocates geometries/textures that
  // three won't free on its own when the object is just detached.
  model.value?.traverse?.((o: any) => {
    o.geometry?.dispose?.()
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
    for (const m of mats) {
      for (const key of Object.keys(m)) {
        const val = (m as any)[key]
        if (val && val.isTexture) val.dispose?.()
      }
      m.dispose?.()
    }
  })
  model.value = null
})
</script>
