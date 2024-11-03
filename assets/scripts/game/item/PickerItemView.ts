const { ccclass, property } = cc._decorator;

import ViewController from '../ViewController';
import PickerItem, { PickerItemStateType, PickerItemSubStateType } from './PickerItem';

@ccclass
export default class PickerItemView extends ViewController<PickerItem> {

    @property
    itemId = 0;

    @property(cc.Node)
    itemEmptyNode: cc.Node = null;

    @property(cc.Node)
    itemWithCoinsNode: cc.Node = null;

    @property(cc.Node)
    itemClosedNode: cc.Node = null;

    @property(cc.Node)
    itemSelectedNode: cc.Node = null;

    @property(cc.Node)
    prizeNode: cc.Node = null;

    @property(cc.Prefab)
    explosionPrefab: cc.Prefab = null; // FB-06

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

        // FB-03 & FB-04
        this.node.active = false;
        this.node.scale = 0;

        const totalItems = 6;
        const totalPlayDelay = 1;
        const targetScale = 1;
        const tweenDuration = totalPlayDelay / totalItems;
        const dalayDuration = tweenDuration * this.itemId;

        this.scheduleOnce(() => {
           this.node.active = true;
            cc.tween(this.node)
                .to(tweenDuration, { scale: targetScale }, { easing: 'backOut'})
                .start();

        }, dalayDuration);
    }

    // FB-05
    private showSelectedState() {
        // Implement logic to show selected state
        this.itemSelectedNode.active = true;

        this.itemEmptyNode.active = false;
        this.itemClosedNode.active = false;
        this.itemWithCoinsNode.active = false;
        this.prizeNode.active = false;
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

        // FB-06
        this.prizeNode.active = true;
        const prize = this.model.value.getPrize();
        const hasPrize = prize.value > 0;
        this.itemWithCoinsNode.active = hasPrize;
        this.itemEmptyNode.active = !hasPrize;
        if (prize.value !== null) {
            this.prizeNode.getComponent(cc.Label).string =`$${prize.value.toFixed(2)}`;
        }
        this.itemSelectedNode.active = false;
        this.itemClosedNode.active = false;
    }

    private showWithPrizeSubState() {
        // Implement logic to show with prize substate
        
    }

    private showRevealedSubState() {
        // Implement logic to show revealed substate

        // FB-06
        const prize = this.model.value.getPrize();
        const hasPrize = prize.value > 0;
        this.itemWithCoinsNode.active = hasPrize;
        this.itemEmptyNode.active = !hasPrize;
        this.prizeNode.active = true;
        if (prize.value !== null) {
            this.prizeNode.getComponent(cc.Label).string =`$${prize.value.toFixed(2)}`;
        }

        this.itemSelectedNode.active = false;
        
        this.itemClosedNode.active = false;

        this.node.opacity = 192;
        this.prizeNode.color = cc.Color.BLACK;

    }

    private showChosenSubState() {
        // Implement logic to show chosen substate

        // FB-06
        const prize = this.model.value.getPrize();
        const hasPrize = prize.value > 0;

        this.itemWithCoinsNode.active = hasPrize;
        this.itemEmptyNode.active = !hasPrize;
        this.prizeNode.active = true;
        if (prize.value !== null) {
            this.prizeNode.getComponent(cc.Label).string =`$${prize.value.toFixed(2)}`;
        }

        this.itemSelectedNode.active = false;
        this.itemClosedNode.active = false;

        cc.instantiate(this.explosionPrefab).parent = this.node;
    }
}