import { ReactiveVariable } from "../utils/ReactiveVariable";
import PickerItem, { PickerItemStateType } from "./item/PickerItem";
import { Server } from "./server/Server";
import { ServerInterface, ServerActionResult } from "./server/ServerActionResult";

export class Game {
    private state: ReactiveVariable<'loading' | 'readyToPlay' | 'playing'>;
    private balance: ReactiveVariable<number>;
    private items: ReactiveVariable<PickerItem[]>;
    private totalWin: ReactiveVariable<number>;
    private currentBet: ReactiveVariable<number>;

    private winAcumulated: ReactiveVariable<number>; // FB-07

    private server: ServerInterface;

    private allowedBets: number[]; // FB-02

    private selecting: boolean = false; // FB-05

    constructor() {
        this.state = new ReactiveVariable<'loading' | 'readyToPlay' | 'playing'>('loading');
        this.balance = new ReactiveVariable<number>(0);
        this.items = new ReactiveVariable<PickerItem[]>([]);
        this.totalWin = new ReactiveVariable<number>(0);
        this.currentBet = new ReactiveVariable<number>(0);
        this.winAcumulated = new ReactiveVariable<number>(0); // FB-07
        this.server = Server;

        this.allowedBets = []; // FB-02
    }

    public async refresh(): Promise<void> {
        if (this.state.value !== 'loading') {
            throw new Error('Game must be in loading state to refresh');
        }
        const result = await this.server.refresh({ recoverFromLocalStorage: false });
        this.updateState(result, true);
    }

    public async play(bet: number): Promise<void> {
        if (this.state.value !== 'readyToPlay') {
            throw new Error('Game must be in readyToPlay state to play');
        }
        this.currentBet.value = bet;
        const result = await this.server.play(bet);
        this.updateState(result);
    }

    // FB-03 & FB-04
    public doPlay(): void {
        this.play(this.currentBet.value);
    }

    public async selectItem(itemId: number): Promise<void> {
        if (this.state.value !== 'playing') {
            throw new Error('Game must be in playing state to select an item');
        }
        if (itemId < 0 || itemId > 5) {
            throw new Error('Invalid item ID');
        }

        // FB-05
        // Select the item locally
        const item = this.items.value[itemId];
        if (item.getState().value === PickerItemStateType.SELECTED || item.getState().value === PickerItemStateType.OPENED) {
            return;
        }

        // FB-05
        if (this.selecting) return;
        this.selecting = true;

        item.select();
    
        // Call the server to select the item
        const result = await this.server.selectItem(itemId);

        // FB-05
        this.selecting = false;

        if (result.state !== 'readyToPlay') {
            let winAcumulated = 0; // FB-07
            for (let i = 0; i < result.prizes.length; i++) {
                if(result.prizes[i] > 0) winAcumulated += result.prizes[i];
            }
            this.winAcumulated.value = winAcumulated; // FB-07
        }
    
        let lastPrize = 0;
        if(result.prizes[itemId] === 0){
            lastPrize = 0;
        }
        else{
            for (let i = 0; i < result.prizes.length; i++) {
                if (result.prizes[i] < 0) {
                    break;
                }
                lastPrize = result.prizes[i];
            }
        } 
        

        // Open the item with the prize from the server response
        item.open(lastPrize, true);
    
        // If the result state is readyToPlay, reveal the rest of the items
        if (result.state === 'readyToPlay') {
            result.selectedIndices.forEach((index, i) => {

                if(result.selectedIndices.indexOf(i) === -1) {
                    const item = this.items.value[i];
                    const prize = result.prizes[i];
                    item.open(prize, false)
                }
            });

        }
    
        // Update the game state
        this.updateState(result);
    }

    // FB-02
    public incrementCurrentBet(): void { 
        const currentIndex = this.allowedBets.indexOf(this.currentBet.value);
        const nextIndex = (currentIndex + 1) % this.allowedBets.length;
        this.currentBet.value = this.allowedBets[nextIndex]
    }

    private updateState(result: ServerActionResult, isInitialRefresh: boolean = false): void {
        this.state.value = result.state;
        this.balance.value = result.balance;
        this.totalWin.value = result.totalWin;
        this.currentBet.value = result.currentBet; // FB-02

        if (isInitialRefresh) {
            this.items.value = result.prizes.map(prize => new PickerItem(prize, this.state.value));
            for (let i = 0; i < result.allowedBets.length; i++) this.allowedBets[i] = result.allowedBets[i]; // FB-02
        }
    }

    public getState(): ReactiveVariable<'loading' | 'readyToPlay' | 'playing'> {
        return this.state;
    }

    public getBalance(): ReactiveVariable<number> {
        return this.balance;
    }

    public getItems(): ReactiveVariable<PickerItem[]> {
        return this.items;
    }

    public getTotalWin(): ReactiveVariable<number> {
        return this.totalWin;
    }

    public getCurrentBet(): ReactiveVariable<number> {
        return this.currentBet;
    }

    public getWinAcumulated(): ReactiveVariable<number> { // FB-07
        return this.winAcumulated;
    }
}

export const game = new Game();