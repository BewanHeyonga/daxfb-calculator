<!--
Author: Alexey Usov (dax@xdax.ru, https://github.com/doubleaxe)
Please don't remove this comment if you use unmodified file
-->
<script setup lang="ts">
import {mdiClose} from '@mdi/js';
import {injectSettings} from '@/scripts/settings';
import {useVModel} from '@vueuse/core';
import {DEFAULT_BLUEPRINT_SPLIT, DEFAULT_PRECISION, MIN_PRECISION} from '@/scripts/types';

const props = defineProps<{
    modelValue: boolean;
}>();
const emit = defineEmits(['update:modelValue']);
const dialog = useVModel(props, 'modelValue', emit);

const settings = injectSettings();
</script>

<template>
    <v-row justify="center">
        <v-dialog
            v-model="dialog"
            fullscreen
        >
            <v-toolbar>
                <v-toolbar-title>设置</v-toolbar-title>
                <v-spacer />
                <v-btn
                    :icon="mdiClose"
                    @click="dialog = false"
                />
            </v-toolbar>
            <v-list subheader density="compact" :lines="false">
                <v-list-subheader>外观</v-list-subheader>
                <v-list-item title="暗黑主题" @click="settings.darkTheme = !settings.darkTheme">
                    <template #subtitle>
                        切换夜间模式
                    </template>
                    <template #prepend>
                        <v-checkbox v-model="settings.darkTheme" />
                    </template>
                </v-list-item>
                <v-list-item title="多种颜色" @click="settings.colorfulLinks = !settings.colorfulLinks">
                    <template #subtitle>
                        切换链接彩色
                    </template>
                    <template #prepend>
                        <v-checkbox v-model="settings.colorfulLinks" />
                    </template>
                </v-list-item>
                <v-list-item title="数量控制s" @click="settings.showCountControlsOnWindow = !settings.showCountControlsOnWindow">
                    <template #subtitle>
                        展示正负符号
                    </template>
                    <template #prepend>
                        <v-checkbox v-model="settings.showCountControlsOnWindow" />
                    </template>
                </v-list-item>
                <v-list-subheader>运算</v-list-subheader>
                <v-list-item title="求解精度">
                    <template #subtitle>
                        更少的数量-以计算时间为代价对工厂io进行更精确的计算。
                        默认为“.001”。
                    </template>
                    <input-number
                        v-model="settings.solvePrecision"
                        :max="1"
                        :min="0"
                        :default-min="MIN_PRECISION"
                        :default-value="DEFAULT_PRECISION"
                    />
                </v-list-item>
                <v-list-subheader>控制</v-list-subheader>
                <v-list-item title="拖拽开关" @click="settings.dragAndDropEnabled = !settings.dragAndDropEnabled">
                    <template #subtitle>
                        启用后，您可以将项目从左面板拖到蓝图、拖链接、拖工厂。
                        不适用于触摸屏设备。
                    </template>
                    <template #prepend>
                        <v-checkbox v-model="settings.dragAndDropEnabled" />
                    </template>
                </v-list-item>
                <v-list-item
                    :disabled="!settings.dragAndDropEnabled"
                    title="自动回弹"
                    @click="settings.overflowScrollEnabled = !settings.overflowScrollEnabled"
                >
                    <template #subtitle>
                        启用后，当任何东西被拖到窗口外部时，蓝图将自动滚动。
                    </template>
                    <template #prepend>
                        <v-checkbox v-model="settings.overflowScrollEnabled" />
                    </template>
                </v-list-item>
                <v-list-item title="允许拖拽" @click="settings.dragAndScrollEnabled = !settings.dragAndScrollEnabled">
                    <template #subtitle>
                        启用后，您可以用鼠标拖动蓝图来滚动蓝图。
                        无法在触摸屏设备上使用。
                    </template>
                    <template #prepend>
                        <v-checkbox v-model="settings.dragAndScrollEnabled" />
                    </template>
                </v-list-item>
                <v-list-item
                    :disabled="!settings.dragAndScrollEnabled"
                    title="外部拖动"
                    @click="settings.dragAndScrollOutsideWindow = !settings.dragAndScrollOutsideWindow"
                >
                    <template #subtitle>
                        启用后，如果鼠标指针被拖到可滚动窗口之外，则将继续拖动和滚动。
                        可能会被禁用以应对Firefox上的一些滚动故障。
                    </template>
                    <template #prepend>
                        <v-checkbox v-model="settings.dragAndScrollOutsideWindow" />
                    </template>
                </v-list-item>
                <v-list-item title="允许单击" @click="settings.pointAndClickEnabled = !settings.pointAndClickEnabled">
                    <template #subtitle>
                        启用后，您可以选择左面板上的项目、链接，然后再次单击将其粘贴。
                        工厂也可以通过工厂菜单以相同的方式移动。
                        专为触摸屏设备设计，但可以在PC上使用。
                        如果同时选择“启用拖放”和“启用点并单击”，
                        在开始拖动之前将暂停，以区分拖动与单击。
                    </template>
                    <template #prepend>
                        <v-checkbox v-model="settings.pointAndClickEnabled" />
                    </template>
                </v-list-item>
                <v-list-item title="允许放缩" @click="settings.scrollScaleEnabled = !settings.scrollScaleEnabled">
                    <template #subtitle>
                        启用后，蓝图将在鼠标轮旋转时缩放。
                    </template>
                    <template #prepend>
                        <v-checkbox v-model="settings.scrollScaleEnabled" />
                    </template>
                </v-list-item>
                <v-list-subheader>保存 (高级)</v-list-subheader>
                <v-list-item title="压缩存档" @click="settings.blueprintCompress = !settings.blueprintCompress">
                    <template #subtitle>
                        控制放缩蓝图的尺寸。
                    </template>
                    <template #prepend>
                        <v-checkbox v-model="settings.blueprintCompress" />
                    </template>
                </v-list-item>
                <v-list-item
                    :disabled="settings.blueprintCompress"
                    title="编码存档"
                    @click="settings.blueprintEncode = !settings.blueprintEncode"
                >
                    <template #subtitle>
                        将原始蓝图编码为Base 64。更适合共享蓝图文本
                    </template>
                    <template #prepend>
                        <v-checkbox v-model="settings.blueprintEncode" />
                    </template>
                </v-list-item>
                <v-list-item
                    :disabled="!settings.blueprintCompress && !settings.blueprintEncode"
                    title="分离编码存档"
                >
                    <template #subtitle>
                        使用换行拆分为块。更适合分享。设置0以禁用拆分
                    </template>
                    <input-number
                        v-model="settings.blueprintSplit"
                        :min="0"
                        :default-value="DEFAULT_BLUEPRINT_SPLIT"
                    />
                </v-list-item>
            </v-list>
        </v-dialog>
    </v-row>
</template>
