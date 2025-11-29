<!--
Author: Alexey Usov (dax@xdax.ru, https://github.com/doubleaxe)
Please don't remove this comment if you use unmodified file
-->
<script setup lang="ts">
import {useErrorHandler, useLinkApi} from '@/composables';
import {injectGameData} from '@/scripts/data';
import {BlueprintEncoder, FileNameHandler} from '@/scripts/model/serializer';
import {injectBlueprintModel} from '@/scripts/model/store';
import {mdiClose, mdiContentCopy, mdiCheck} from '@mdi/js';
import {useClipboard, useLocalStorage, useVModel} from '@vueuse/core';
import {computed, onUnmounted, ref, unref, watch} from 'vue';
import {__DEBUG__} from '@/scripts/debug';
import {injectSettings} from '@/scripts/settings';

const props = defineProps<{
    modelValue: boolean;
}>();
const emit = defineEmits(['update:modelValue']);
const dialog = useVModel(props, 'modelValue', emit);
const {copy, copied, isSupported: isClipboardSupported} = useClipboard();
const {showError} = useErrorHandler();
const {exec, abortController} = useLinkApi();
const gameData = injectGameData();
const settings = injectSettings();
const blueprintModel = injectBlueprintModel();

const generatedLink = ref('');
const copyIcon = computed(() => {
    if(!unref(isClipboardSupported) || !unref(generatedLink)) {
        return '';
    }
    return unref(copied) ? mdiCheck : mdiContentCopy;
});
const isLoading = ref(false);
const blueprintName = ref('');
let linkId = '';

function buildBlueprintData() {
    const encoder = new BlueprintEncoder(gameData, {
        blueprintCompress: true,
    });
    const encoded = encoder.encode(blueprintModel.save());
    return encoded;
}

function regenerateLinkText() {
    if(!linkId)
        return;

    //you don't want to share your file:/// address, do you?
    const baseUrl = __DEBUG__ ?
        [location.protocol, '//', location.host, location.pathname].join('') :
        'https://doubleaxe.github.io/daxfb-calculator/';

    let _generatedLink = `${baseUrl}?link=${encodeURIComponent(linkId)}`;
    if(settings.appendFileNameToLink) {
        let fileName = FileNameHandler.blueprintNameToFileName(unref(blueprintName));
        const match = /^(.*)\.txt$/i.exec(fileName);
        if(match) {
            fileName = match[1];
        }
        _generatedLink += `&name=${encodeURIComponent(fileName)}`;
    }
    generatedLink.value = _generatedLink;
}

const linkSession = useLocalStorage('linkapi-session', {sessionId: ''});
async function generateLink() {
    type LoginResponse = {
        sessionId: string;
    };
    type GenerateLinkResponse = {
        link: string;
    };

    isLoading.value = true;
    try {
        let attempts = 0;
        for(;;) {
            let sessionId = unref(linkSession).sessionId;
            if(!sessionId) {
                ({sessionId} = await exec<LoginResponse>('login', {}));
                unref(linkSession).sessionId = sessionId;
            }

            try {
                const gameId = gameData.gameDescription.name;
                const _blueprintName = unref(blueprintName);
                const blueprintData = buildBlueprintData();
                const {link} = await exec<GenerateLinkResponse>('save', {
                    sessionId,
                    gameId,
                    name: _blueprintName,
                    data: blueprintData,
                });

                linkId = link;
                regenerateLinkText();
                break;
            } catch(err) {
                if(attempts >= 1) {
                    throw err;
                }
                if((err as Error)?.name === 'err:session') {
                    unref(linkSession).sessionId = '';
                    attempts++;
                } else {
                    throw err;
                }
            }
        }
    } catch(err) {
        if((err as Error)?.name !== 'AbortError') {
            showError('Failed to generate link', err);
        }
    } finally {
        isLoading.value = false;
    }
}

onUnmounted(() => {
    unref(abortController)?.abort();
});
watch(() => props.modelValue, (value, oldValue) => {
    if(!value) {
        unref(abortController)?.abort();
    } else if(value && !oldValue) {
        linkId = '';
        generatedLink.value = '';
        blueprintName.value = blueprintModel.blueprintName;
        isLoading.value = false;
    }
});
watch(blueprintName, (value) => {
    if(!value) {
        blueprintName.value = blueprintModel.getDefaultBlueprintName();
    }
    blueprintModel.blueprintName = unref(blueprintName);
    regenerateLinkText();
});
watch(() => settings.appendFileNameToLink, regenerateLinkText);
</script>

<template>
    <v-dialog v-model="dialog">
        <v-sheet>
            <v-toolbar>
                <v-toolbar-title>生成蓝图链接</v-toolbar-title>
                <v-spacer />
                <v-btn
                    :icon="mdiClose"
                    @click="dialog = false"
                />
            </v-toolbar>
            <v-container style="position: relative;">
                <v-alert type="info">
                    链接旨在用于与其他人共享蓝图。
                    它们不是设计为本地文件存储替代品。
                    为了生成链接，蓝图数据将被上传到远程（我的）服务器。
                    我将尽可能长时间地保持此服务器在线状态，但如果发生故障，所有共享蓝图可能会丢失。
                </v-alert>
                <v-row dense class="mt-2">
                    <v-col>
                        <v-text-field
                            v-model="blueprintName"
                            label="编辑蓝图描述"
                            density="comfortable"
                            hide-details
                            clearable
                            @click:clear="blueprintName = blueprintModel.getDefaultBlueprintName()"
                        />
                    </v-col>
                    <v-col cols="4">
                        <v-checkbox
                            v-model="settings.appendFileNameToLink"
                            label="将文件名（作为提示）嵌入生成的链接中"
                            density="compact"
                            hide-details
                        />
                    </v-col>
                </v-row>
                <v-row dense class="mt-2">
                    <v-col>
                        <v-text-field
                            v-model="generatedLink"
                            label="生成链接"
                            density="comfortable"
                            hide-details
                            readonly
                            :append-inner-icon="copyIcon"
                            @click:append-inner="copy(generatedLink)"
                        />
                    </v-col>
                </v-row>
                <v-row dense class="mt-2">
                    <v-btn
                        color="primary"
                        block
                        @click="generateLink()"
                    >
                        Generate Link
                    </v-btn>
                </v-row>
                <v-overlay
                    v-model="isLoading"
                    contained
                    persistent
                    class="d-flex align-center"
                >
                    <div class="d-flex justify-center">
                        <v-progress-circular indeterminate color="primary" />
                    </div>
                </v-overlay>
            </v-container>
        </v-sheet>
    </v-dialog>
</template>
