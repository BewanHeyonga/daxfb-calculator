<!--
Author: Alexey Usov (dax@xdax.ru, https://github.com/doubleaxe)
Please don't remove this comment if you use unmodified file
-->
<script setup lang="ts">
import {injectBlueprintModel} from '@/scripts/model/store';
import {mdiClose} from '@mdi/js';
import {useVModel} from '@vueuse/core';
import {ref, unref} from 'vue';

const props = defineProps<{
    modelValue: boolean;
}>();
const emit = defineEmits(['update:modelValue']);
const dialog = useVModel(props, 'modelValue', emit);
const roundingMode = ref('ceil');
const blueprintModel = injectBlueprintModel();

function applyFactoryCounts() {
    const roundToCeil = unref(roundingMode) === 'ceil';
    const setOne = unref(roundingMode) === 'one';
    blueprintModel.applyCalculatedFactoryCount((solvedCount) => {
        if(roundToCeil) {
            return Math.ceil(solvedCount);
        }
        if(setOne) {
            return 1;
        }
        return solvedCount;
    });
    dialog.value = false;
}
</script>

<template>
    <v-dialog v-model="dialog">
        <v-sheet>
            <v-toolbar>
                <v-toolbar-title>自动申请工厂数目</v-toolbar-title>
                <v-spacer />
                <v-btn
                    :icon="mdiClose"
                    @click="dialog = false"
                />
            </v-toolbar>
            <v-container>
                <v-alert type="warning">
                    这将对所有工厂应用自动计算的工厂计数。
                    结果，手动设置的计数将等于自动计算的计数。
                </v-alert>
                <v-row dense class="mt-2">
                    <v-col>
                        <v-radio-group v-model="roundingMode" inline>
                            <v-radio
                                label="向上取整"
                                value="ceil"
                            />
                            <v-radio
                                label="允许小数"
                                value="fractional"
                            />
                            <v-radio
                                label="将所有计数设置为1"
                                value="one"
                            />
                        </v-radio-group>
                    </v-col>
                </v-row>
                <v-row dense class="mt-2">
                    <v-col>
                        <v-btn
                            color="primary"
                            block
                            @click="applyFactoryCounts()"
                        >
                            Apply Factory Counts
                        </v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-sheet>
    </v-dialog>
</template>
