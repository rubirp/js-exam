import { ReactiveVariable } from '../utils/ReactiveVariable';
import { game, Game } from './Game';
import PickerItem from './item/PickerItem';
import PickerItemView from './item/PickerItemView';
import ViewController from './ViewController';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameView extends ViewController<Game> {

    @property(cc.Label)
    balanceLabel: cc.Label = null;

    @property(cc.Label)
    totalWinLabel: cc.Label = null;

    @property(cc.Node)
    pickerItemViews: cc.Node[] = [];

    @property(cc.Node)
    loadingNode: cc.Node = null;

    @property(cc.Node)
    readyToPlayNode: cc.Node = null;

    onLoad() {
        this.model = new ReactiveVariable<Game>(game);

        // Subscribe to changes in the game state
        this.model.value.getState().subscribe(this.updateState.bind(this));
        this.model.value.getBalance().subscribe(this.updateBalance.bind(this));
        this.model.value.getTotalWin().subscribe(this.updateTotalWin.bind(this));
        this.model.value.getItems().subscribe(this.updatePickerItems.bind(this));

        // Initialize the view
        this.updateState(this.model.value.getState().value);
        this.updateBalance(this.model.value.getBalance().value);
        this.updateTotalWin(this.model.value.getTotalWin().value);
        this.updatePickerItems(this.model.value.getItems().value);

        // Refresh the game
        game.refresh();
    }

    updateState(newState: 'loading' | 'readyToPlay' | 'playing') {
        switch (newState) {
            case 'loading':
                this.showLoadingState();
                break;
            case 'readyToPlay':
                this.showReadyToPlayState();
                break;
            case 'playing':
                this.showPlayingState();
                break;
        }
    }

    showLoadingState() {
        this.loadingNode.active = true;
        this.readyToPlayNode.active = false;
        // Additional logic for loading state
    }

    showReadyToPlayState() {
        this.loadingNode.active = false;
        this.readyToPlayNode.active = true;
        // Additional logic for readyToPlay state
    }

    showPlayingState() {
        this.loadingNode.active = false;
        this.readyToPlayNode.active = false;
        // Additional logic for playing state
    }

    updateBalance(newBalance: number) {
        this.balanceLabel.string = `${newBalance}`;
    }

    updateTotalWin(newTotalWin: number) {
        this.totalWinLabel.string = `${newTotalWin}`;
    }

    updatePickerItems(newItems: PickerItem[]) {
        newItems.forEach((item, index) => {
            const pickerItemView = this.pickerItemViews[index].getComponent(PickerItemView);
            pickerItemView.model.value = item;
        });
    }
}