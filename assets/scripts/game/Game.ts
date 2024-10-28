import { ReactiveVariable } from "../utils/ReactiveVariable";
import PickerItem from "./item/PickerItem";
import { Server } from "./server/Server";
import { ServerInterface, ServerActionResult } from "./server/ServerActionResult";

export class Game {
    private state: ReactiveVariable<'loading' | 'readyToPlay' | 'playing'>;
    private balance: ReactiveVariable<number>;
    private items: ReactiveVariable<PickerItem[]>;
    private totalWin: ReactiveVariable<number>;
    private currentBet: ReactiveVariable<number>;
    private server: ServerInterface;

    constructor() {
        this.state = new ReactiveVariable<'loading' | 'readyToPlay' | 'playing'>('loading');
        this.balance = new ReactiveVariable<number>(0);
        this.items = new ReactiveVariable<PickerItem[]>([]);
        this.totalWin = new ReactiveVariable<number>(0);
        this.currentBet = new ReactiveVariable<number>(0);
        this.server = Server;
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

    public async selectItem(itemId: number): Promise<void> {
        if (this.state.value !== 'playing') {
            throw new Error('Game must be in playing state to select an item');
        }
        if (itemId < 0 || itemId > 5) {
            throw new Error('Invalid item ID');
        }
    
        // Select the item locally
        this.items[itemId].select();
    
        // Call the server to select the item
        const result = await this.server.selectItem(itemId);
    
        // Open the item with the prize from the server response
        this.items[itemId].open(result.prizes[itemId], true);
    
        // If the result state is readyToPlay, reveal the rest of the items
        if (result.state === 'readyToPlay') {
            result.selectedIndices.forEach((index) => this.items[index].open(result.prizes[index], false));
        }
    
        // Update the game state
        this.updateState(result);
    }
    

    private updateState(result: ServerActionResult, isInitialRefresh: boolean = false): void {
        this.state.value = result.state;
        this.balance.value = result.balance;
        this.totalWin.value = result.totalWin;

        if (isInitialRefresh) {
            this.items.value = result.prizes.map(prize => new PickerItem(prize, this.state.value));
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
}

export const game = new Game();