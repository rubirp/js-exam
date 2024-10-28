const { ccclass, property } = cc._decorator;

import ViewController from '../ViewController';
import PickerItem, { PickerItemStateType, PickerItemSubStateType } from './PickerItem';

@ccclass
export default class PickerItemView extends ViewController<PickerItem> {

    @property
    itemId = 0;

    onLoad(): void {
        this.model.subscribe(this.onModelChange.bind(this));
        this.onModelChange(this.model.value);
    }

    onModelChange(newModel: PickerItem) {
        if (newModel) {
            newModel.getState().subscribe(this.updateView.bind(this));
            newModel.getSubState().subscribe(this.updateView.bind(this));
            newModel.isItemDisabled().subscribe(this.updateView.bind(this));
            this.updateView();
        }
    }

    updateView() {
        if (this.model.value.isItemDisabled().value) {
            this.showDisabledState();
        } else {
            switch (this.model.value.getState().value) {
                case PickerItemStateType.IDLE:
                    this.showIdleState();
                    break;
                case PickerItemStateType.SELECTED:
                    this.showSelectedState();
                    break;
                case PickerItemStateType.OPENED:
                    this.showOpenedState();
                    break;
            }
        }
    }

    private showDisabledState() {
        // Implement logic to show disabled state
    }

    private showIdleState() {
        // Implement logic to show idle state
    }

    private showSelectedState() {
        // Implement logic to show selected state
    }

    private showOpenedState() {
        // Implement logic to show opened state
        switch (this.model.value.getSubState().value) {
            case PickerItemSubStateType.EMPTY:
                this.showEmptySubState();
                break;
            case PickerItemSubStateType.WITH_PRIZE:
                this.showWithPrizeSubState();
                break;
            case PickerItemSubStateType.REVEALED:
                this.showRevealedSubState();
                break;
            case PickerItemSubStateType.CHOSEN:
                this.showChosenSubState();
                break;
        }
    }

    private showEmptySubState() {
        // Implement logic to show empty substate
    }

    private showWithPrizeSubState() {
        // Implement logic to show with prize substate
    }

    private showRevealedSubState() {
        // Implement logic to show revealed substate
    }

    private showChosenSubState() {
        // Implement logic to show chosen substate
    }
}