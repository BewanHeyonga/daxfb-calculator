<!--
Author: Alexey Usov (dax@xdax.ru, https://github.com/doubleaxe)
Please don't remove this comment if you use unmodified file
-->
<script setup lang="ts">
import {injectBlueprintModel} from '@/scripts/model/store';
import {mdiDotsVertical, mdiDelete, mdiCog, mdiHelpCircle, mdiArrangeSendToBack, mdiCounter, mdiInformationOutline} from '@mdi/js';
import {ref} from 'vue';

const blueprintModel = injectBlueprintModel();
const showSettingsDialog = ref(false);
const showHelpDialog = ref(false);
const showAboutDialog = ref(false);
const showAutoLayoutDialog = ref(false);
const showApplyCountDialog = ref(false);
</script>

<template>
    <v-menu>
        <template #activator="{ props }">
            <v-btn :icon="mdiDotsVertical" v-bind="props" />
        </template>
        <v-list>
            <v-list-item
                :prepend-icon="mdiDelete"
                title="全部移除"
                @click="blueprintModel.clear()"
            />
            <v-divider horizontal />
            <v-list-item
                :prepend-icon="mdiArrangeSendToBack"
                title="自动布局"
                @click="showAutoLayoutDialog = true"
            />
            <v-list-item
                :prepend-icon="mdiCounter"
                title="更新计数"
                @click="showApplyCountDialog = true"
            />
            <v-divider horizontal />
            <v-list-item
                :prepend-icon="mdiCog"
                title="设置"
                @click="showSettingsDialog = true"
            />
            <v-list-item
                :prepend-icon="mdiHelpCircle"
                title="帮助"
                @click="showHelpDialog = true"
            />
            <v-list-item
                :prepend-icon="mdiInformationOutline"
                title="关于"
                @click="showAboutDialog = true"
            />
        </v-list>
    </v-menu>
    <div class="d-none">
        <graph-layout-dialog v-model="showAutoLayoutDialog" />
        <apply-count-dialog v-model="showApplyCountDialog" />
        <settings-dialog v-model="showSettingsDialog" />
        <help-dialog v-model="showHelpDialog" />
        <about-dialog v-model="showAboutDialog" />
    </div>
</template>
