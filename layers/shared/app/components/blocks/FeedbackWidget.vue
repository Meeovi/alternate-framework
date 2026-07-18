<template>
    <div class="wrapper">
        <Transition name="fade" mode="out-in">
            <div v-if="!feedback.rating" class="step">
                <div>
                    <div>
                        <p class="desc">How was this content?</p>
                        <p class="heading">What is the rating you give this?</p>
                    </div>
                </div>
                <div class="button-container">
                    <v-btn v-for="item in ratingOptions"
                        :key="item.value"
                        class="btn"
                        @click="handleSubmission(item.value)"> // [!code ++]
                        <span>{{ item.label }}</span>
                    </v-btn>
                </div>
            </div>
            <div v-else-if="feedback.rating && !success" class="step">
                <div>
                    <p class="desc">This content is</p>
                    <div>
                        <span>{{ getRatingOption(feedback.rating)?.label }}</span>
                        <v-btn style="margin-left: 0.5rem" class="btn" @click="feedback.rating = undefined">
                            <span mi icon>close</span>
                        </v-btn>
                    </div>
                </div>
                <p class="heading">{{ getRatingOption(feedback.rating)?.message }}</p>
                <v-textarea v-model="feedback.content" autofocus class="input" />
                <v-btn
                    class="btn btn-primary"
                    :disabled="!feedback.content"
                    @click="handleSubmission()"> // [!code ++]
                    Send Us Your Feedback
                </v-btn>
            </div>
            <div v-else class="step">
                <p class="heading">Thanks for your feedback!</p>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const props = defineProps<{ name: string; url: string }>();

const feedback = reactive<{
    id?: string;
    rating?: number;
    content?: string;
}>({});

const ratingOptions = [ 
    { label: 'Worst Doc Ever 🗑️', value: 1, message: 'Woof! 🤦‍♂️ Sorry about that. How do we fix it?' }, 
    { label: 'Not Helpful 😡', value: 2, message: '🧐 Help us do better. How can we improve this article?' }, 
    { label: 'Helpful 😃', value: 3, message: 'Nice! 👍 Anything we can improve upon?' }, 
    { label: 'Super Helpful 🤩', value: 4, message: `Awesome! The whole team is rejoicing in celebration! 🥳🎉🎊 Anything you'd like to say to them?` }, 
]; 

function getRatingOption(rating: number) { 
    return ratingOptions.find((option) => option.value === rating); 
} 

async function handleSubmission(rating?: number) {
    loading.value = true;
    if (rating) feedback.rating = rating;

    const body = {
        id: feedback.id,
        rating: feedback.rating,
        content: feedback.content,
        name: props.name,
        url: props.url,
    };

    // Replace this with your own Directus URL
    const directusBaseUrl = `${config.public.directus.url}`;

    try {
        let response;

        // If we've already created a feedback record, we'll update it with the new rating or content.
        if (feedback.id) {
            response = await fetch(`${directusBaseUrl}/items/report/${feedback.id}`, {
                method: 'PUT',
                body: JSON.stringify(body),
            });
        } else {
            response = await fetch(`${directusBaseUrl}/items/report/${feedback.id}`, {
                method: 'POST',
                body: JSON.stringify(body),
            });
        }

        const data = await response.json();
        feedback.id = data.id;

        // If the response has content, we can assume they've completed the second step. So we'll show the success message.
        if (data.content) {
            success.value = true;
        }
    } catch (err) {
        error.value = err;
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>

.wrapper {
    margin: 2rem 0;
    padding: 1.5rem;
    border: 1px solid rgba(60, 60, 67, .12);
    border-radius: 8px;
    background: #f6f6f7;
}

.step > * + * {
    margin-top: 1rem;
}

.desc {
    display: block;
    line-height: 20px;
    font-size: 12px;
    font-weight: 500;
    color: rgba(60, 60, 67, .75);
}

.heading {
    font-size: 1.2rem;
    font-weight: 700;
}

.v-btn-container {
    display: grid;
    grid-gap: 0.5rem;
}

.btn {
    border: 1px solid solid rgba(60, 60, 67, .12);
    background-color: #ffffff;
    border-radius: 8px;
    transition: border-color 0.25s, background-color 0.25s;
    display: inline-block;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    margin: 0;
    padding: 0.375rem 0.75rem;
    text-align: center;
    vertical-align: middle;
    white-space: nowrap;
}

.btn:disabled {
    opacity: 0.5;
}

.btn:hover {
    border-color: #6644ff;
}

.btn-primary {
    color: #fff;
    background-color: #6644ff;
    border-color: #6644ff;
}

.btn-primary:hover {
    background-color: #4422dd;
    border-color: #4422dd;
}

.input {
    width: 100%;
    height: 100px;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0.375rem 0.75rem;
}

@media screen and (min-width: 768px) {
    .v-btn-container {
        grid-template-columns: repeat(4, 1fr);
    }
}
</style>