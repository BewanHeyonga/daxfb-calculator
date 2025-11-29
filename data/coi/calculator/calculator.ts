/*
Author: Alexey Usov (dax@xdax.ru, https://github.com/doubleaxe)
Please don't remove this comment if you use unmodified file
*/
import type {
    Calculator,
} from '#types/calculator';
import {GameItemType} from '#types/constants';
import {type GameItemExData, GameItemExType} from '../types/custom-game-data';

export function useCalculator(): Calculator {
    const getCountPerSecond: Calculator['getCountPerSecond'] = function(item, io) {
        const productExdata = io.product.exdata as GameItemExData;
        //maintenance depot outputs at timed rate, but inputs is always listed as per-minute, unrelative to time
        //pollution also scales per time
        //electricity is always fixed rate, the same for other virtual items
        const isMaintenanceDepot = (productExdata.exType === GameItemExType.Maintenance) && !io.isInput;
        const isPollution = (productExdata.exType === GameItemExType.Pollution);
        if((io.product.type === GameItemType.Special) && !isMaintenanceDepot && !isPollution) {
            return io.count;
        }
        return io.count * 60 / io.recipe.time;
    };

    const unitsForType: {[K in GameItemExType]: string} = {
        [GameItemExType.Unknown]: '单位',
        [GameItemExType.Electricity]: '瓦',
        [GameItemExType.MechPower]: '牛',
        [GameItemExType.Computing]: '次',
        [GameItemExType.Upoints]: '单位',
        [GameItemExType.Maintenance]: '单位',
        [GameItemExType.Pollution]: '计数',
        [GameItemExType.Worker]: '人',
    };
    const formatCountPerSecond: Calculator['formatCountPerSecond'] = (item, count) => {
        const itemExdata = item.exdata as GameItemExData;
        let unit = itemExdata.exType ? unitsForType[itemExdata.exType] : '单位';
        if((itemExdata.exType === GameItemExType.Electricity) || (itemExdata.exType === GameItemExType.MechPower)) {
            count *= 1000;
        } else if(itemExdata.exType === GameItemExType.Computing) {
            //TFlops by default
            if(count < 1000) {
                unit = '次';
            } else {
                count *= 1e12;
            }
        }
        return {
            count,
            unit,
        };
    };

    return {
        getCountPerSecond,
        formatCountPerSecond,
    };
}
