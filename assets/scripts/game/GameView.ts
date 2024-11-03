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

    // FB-02
    @property(cc.Label)
    currenBetLabel: cc.Label = null;

    // FB-02
    @property(cc.Node)
    currentBetNode: cc.Node = null;

    // FB-03 & FB-04
    @property(cc.Button)
    playButton: cc.Button = null;

    private targetWinAmount: number = 0; // FB-07
    private originWinAmount: number = 0; // FB-07
    private currentWinAmount: number = 0; // FB-07
    private animationDuration: number = 2; // FB-07
    private elapsedTime: number = 0; // FB-07

    onLoad() {
        this.model = new ReactiveVariable<Game>(game);

        // Subscribe to changes in the game state
        this.model.value.getState().subscribe(this.updateState.bind(this));
        this.model.value.getBalance().subscribe(this.updateBalance.bind(this));
        this.model.value.getTotalWin().subscribe(this.updateTotalWin.bind(this));
        this.model.value.getItems().subscribe(this.updatePickerItems.bind(this));
        this.model.value.getCurrentBet().subscribe(this.updateCurrentBet.bind(this)); // FB-02
        this.model.value.getWinAcumulated().subscribe(this.updateTotalWinAcumulated.bind(this)); // FB-07

        // Initialize the view
        this.updateState(this.model.value.getState().value);
        this.updateBalance(this.model.value.getBalance().value);
        this.updateTotalWin(this.model.value.getTotalWin().value);
        this.updatePickerItems(this.model.value.getItems().value);
        this.updateCurrentBet(this.model.value.getCurrentBet().value); // FB-02

        // Initialize view events

        // FB-02
        this.currentBetNode.on(cc.Node.EventType.TOUCH_END, () => {
            if(this.playButton.interactable){ // FB-03 & FB-04
                this.model.value.incrementCurrentBet()
            }
        }, this);

        // FB-05
        for (let i = 0; i < this.pickerItemViews.length; i++) {
            this.pickerItemViews[i].on(cc.Node.EventType.TOUCH_END, () => {
                const gameState = game.getState().value;
                const itemComponent = this.pickerItemViews[i].getComponent(PickerItemView);
                if(gameState ==='playing'){
                    game.selectItem(itemComponent.itemId);
                }
            }, this);
        }

        // FB-08
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            if(this.targetWinAmount > 0){
                this.currentWinAmount = this.targetWinAmount;
                this.totalWinLabel.string = `$${this.targetWinAmount.toFixed(2)}`
                this.targetWinAmount = 0;
            }
        }, this);

        // Refresh the game
        game.refresh();
    }

    onDestroy(): void {
        // destroy the view events
        this.currentBetNode.off(cc.Node.EventType.TOUCH_END, null, this); // FB-02

        // FB-06
        for (let i = 0; i < this.pickerItemViews.length; i++) {
            this.pickerItemViews[i].off(cc.Node.EventType.TOUCH_END, null, this);
        }
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
        
        this.targetWinAmount = 0;
        this.originWinAmount = 0; 
        this.currentWinAmount = 0;
        this.elapsedTime = 0;
        
    }

    showPlayingState() {
        // this.loadingNode.active = false;
        // this.readyToPlayNode.active = false;
        // Additional logic for playing state
    }

    updateBalance(newBalance: number) {
        this.balanceLabel.string = `$${newBalance}`;
        if (game.getState().value === 'readyToPlay'){
            this.playButton.interactable = newBalance >= game.getCurrentBet().value;
        }
    }

    updateTotalWin(newTotalWin: number) {
        this.totalWinLabel.string = `$${newTotalWin.toFixed(2)}`
    }

    // FB-07
    updateTotalWinAcumulated(totalWinAcumulated: number) {
        this.elapsedTime = 0;
        this.targetWinAmount = totalWinAcumulated;
        this.originWinAmount = this.currentWinAmount;

        const baseDuration = 2;
        const gainAmount = this.targetWinAmount - this.originWinAmount;
        const totalBet = game.getCurrentBet().value;
        this.animationDuration = baseDuration * gainAmount / totalBet;
    }

    // FB-07
    update(dt: number): void {
        if (this.currentWinAmount >= this.targetWinAmount) {
            return;
        }

        this.elapsedTime += dt;

        const progress = Math.min(this.elapsedTime / this.animationDuration, 1);
        this.currentWinAmount = cc.misc.lerp(this.originWinAmount, this.targetWinAmount, progress);
        
        this.totalWinLabel.string = `$${this.currentWinAmount.toFixed(2)}`;

        if (progress === 1) {
            this.targetWinAmount = 0;
        }
    }

    updatePickerItems(newItems: PickerItem[]) {
        newItems.forEach((item, index) => {
            const pickerItemView = this.pickerItemViews[index].getComponent(PickerItemView);
            pickerItemView.model.value = item;
        });
    }

    // FB-02
    updateCurrentBet(newCurrentBet: number) {
        this.currenBetLabel.string = `$${newCurrentBet}`;
        if (game.getState().value === 'readyToPlay'){
            this.playButton.interactable = game.getBalance().value >= newCurrentBet;
        }
    }

    // FB-03 & FB-04
    onPlayButtonClicked() {
        // First, disable the play button to prevent multiple clicks
        this.playButton.interactable = false;

        const items = this.model.value.getItems().value;
        items.forEach((item) => {
            item.enable();
            item.reset();
        });

        // Then, do the play
        game.doPlay();
    }
}