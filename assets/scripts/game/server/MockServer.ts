import { ServerActionResult, ServerInterface } from './ServerActionResult';

interface RefreshOptions {
    recoverFromLocalStorage: boolean;
}

interface ServerOptions {
    skipDelay?: boolean;
}

export default class MockServer implements ServerInterface {

    private gameState: ServerActionResult;
    private skipDelay: boolean;

    private ranges: [number, number][] = [
        [0, 0.5],
        [0.5, 0.75],
        [0.75, 1],
        [1, 1.25],
        [1.25, 1.5],
        [1.5, 1.75],
        [1.75, 2],
        [2, 3],
        [3, 10],
        [10, 20]
    ];

    private probabilities = [
        0.025,
        0.0125,
        0.025,
        0.025,
        0.05625,
        0.05625,
        0.0375,
        0.125,
        0.35,
        0.25
    ];

    constructor(options?: ServerOptions) {
        this.gameState = this.createInitialGameState();
        this.skipDelay = options?.skipDelay ?? false;
    }

    private createInitialGameState(): ServerActionResult {
        const sessionNumber = this.getSessionNumberFromCookies();
        const state = sessionNumber ? 'playing' : 'loading';
        const prizes = Array(6).fill(-1); // Initialize prizes with -1
        const selectedIndices = Array(6).fill(-1); // Initialize selected indices with -1
        const allowedBets = [0.10, 0.25, 0.5, 1.00, 2.00, 5.00, 10.00, 50.00, 100.00]; // Define allowed bets
        return {
            sessionNumber,
            state,
            balance: 1000,
            prizes,
            selectedIndices,
            totalWin: 0,
            allowedBets, // Include allowedBets in the initial state
            currentBet: 1. // Initialize currentBet to 0
        };
    }

    private getSessionNumberFromCookies(): number {
        const sessionNumber = parseInt(document.cookie.replace(/(?:(?:^|.*;\s*)sessionNumber\s*\=\s*([^;]*).*$)|^.*$/, "$1"));
        const sessionTime = parseInt(document.cookie.replace(/(?:(?:^|.*;\s*)sessionTime\s*\=\s*([^;]*).*$)|^.*$/, "$1"));
        const currentTime = Date.now();
        if (isNaN(sessionNumber) || isNaN(sessionTime) || (currentTime - sessionTime) > 5 * 60 * 1000) {
            return 0;
        }
        return sessionNumber;
    }

    private clearCookies() {
        document.cookie = 'sessionNumber=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'sessionTime=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    private saveSessionToCookies(sessionNumber: number) {
        const currentTime = Date.now();
        document.cookie = `sessionNumber=${sessionNumber}; path=/`;
        document.cookie = `sessionTime=${currentTime}; path=/`;
    }

    private saveSessionToLocalStorage() {
        const gameStateString = JSON.stringify(this.gameState);
        localStorage.setItem('gameState', gameStateString);
    }

    private loadSessionFromLocalStorage(): ServerActionResult | null {
        const gameStateString = localStorage.getItem('gameState');
        if (gameStateString) {
            return JSON.parse(gameStateString);
        }
        return null;
    }
    async refresh(options?: RefreshOptions): Promise<ServerActionResult> {
        await this.simulateDelay();
        if (options?.recoverFromLocalStorage) {
            const savedState = this.loadSessionFromLocalStorage();
            if (savedState) {
                this.gameState = savedState;
                if (this.gameState.state !== 'playing') {
                    console.error('Loaded state is not in playing state, clearing session.');
                    this.clearCookies();
                    localStorage.removeItem('gameState');
                    this.gameState.sessionNumber = 1;
                    this.gameState.state = 'readyToPlay';
                } else {
                    // Reveal only the selected prizes
                    this.gameState.prizes = this.gameState.selectedIndices.map((index, i) =>
                        index >= 0 ? this.gameState.prizes[i] : -1
                    );
                    this.gameState.totalWin = 0; // Hide totalWin when in playing state
                }
            } else {
                console.error('No saved state found in localStorage');
                this.clearCookies();
                this.gameState.sessionNumber = 1;
                this.gameState.state = 'readyToPlay';
            }
        } else {
            this.clearCookies();
            localStorage.removeItem('gameState');
            this.gameState.sessionNumber = 1;
            this.gameState.state = 'readyToPlay';
        }
        this.saveSessionToCookies(this.gameState.sessionNumber);
        if (this.gameState.state === 'playing') {
            this.saveSessionToLocalStorage();
        }
        return this.gameState;
    }

    async play(bet: number): Promise<ServerActionResult> {
        await this.simulateDelay();

        if (this.gameState.state !== 'readyToPlay') {
            return { ...this.gameState, error: 'Game is not ready to play' };
        }

        if (!this.gameState.allowedBets.includes(bet)) {
            return { ...this.gameState, error: 'Invalid bet amount' };
        }

        if (this.gameState.balance < bet) {
            return { ...this.gameState, error: 'Insufficient balance to play' };
        }

        this.gameState.balance -= bet;
        this.gameState.state = 'playing';
        this.gameState.currentBet = bet; // Save the current bet.

        // Compute the total reward
        const totalReward = this.computeTotalReward(bet);
        this.gameState.totalWin = totalReward;

        // Construct the set of possibilities for selection
        this.gameState.prizes = this.constructSelectionSet(totalReward, bet);
        this.gameState.selectedIndices = Array(6).fill(-1); // Reset selected indices

        this.saveSessionToCookies(this.gameState.sessionNumber);
        this.saveSessionToLocalStorage();
        return { ...this.gameState, totalWin: 0 }; // Hide totalWin from the client
    }

    async selectItem(itemId: number): Promise<ServerActionResult> {
        await this.simulateDelay();

        // Validate itemId
        if (itemId < 0 || itemId > 5) {
            return { ...this.gameState, error: 'Invalid item ID' };
        }

        if (this.gameState.state !== 'playing') {
            return { ...this.gameState, error: 'Game is not in playing state' };
        }

        if (this.gameState.selectedIndices.includes(itemId)) {
            return { ...this.gameState, error: 'Item already selected' };
        }

        // Find the first available position with index -1
        const availableIndex = this.gameState.selectedIndices.findIndex(index => index === -1);
        if (availableIndex === -1) {
            return { ...this.gameState, error: 'No available positions' };
        }

        // Update the selected index and prize at the available position
        const prize = this.gameState.prizes[itemId];
        this.gameState.selectedIndices[availableIndex] = itemId;

        // Create a copy of the prizes array to reveal only the selected prizes
        const revealedPrizes = this.gameState.selectedIndices.map((index, i) =>
            index >= 0 ? this.gameState.prizes[i] : -1
        );

        // Check if the selected prize is 0 or if this is the fifth item
        if (prize === 0 || this.gameState.selectedIndices.filter(index => index !== -1).length === 5) {
            this.gameState.balance += this.gameState.totalWin;
            this.gameState.state = 'readyToPlay';
            this.saveSessionToLocalStorage();
            return { ...this.gameState, prizes: this.gameState.prizes.slice(0), totalWin: this.gameState.totalWin }; // Reveal totalWin to the client
        }

        this.saveSessionToCookies(this.gameState.sessionNumber);
        this.saveSessionToLocalStorage();
        return { ...this.gameState, prizes: revealedPrizes, totalWin: 0 }; // Hide totalWin from the client
    }

    private computeTotalReward(bet: number): number {
        const rangeIndex = this.chooseRange();
        const range: [number, number] = this.ranges[rangeIndex];
        const rewardMultiplier = this.selectValueInRange(range);
        return parseFloat((rewardMultiplier * bet).toFixed(2));
    }

    private chooseRange(): number {
        const randomValue = Math.random();
        let cumulativeProbability = 0;
        for (let i = 0; i < this.probabilities.length; i++) {
            cumulativeProbability += this.probabilities[i];
            if (randomValue < cumulativeProbability) {
                return i;
            }
        }
        return this.probabilities.length - 1; // Fallback to the last range
    }

    private selectValueInRange(range: [number, number]): number {
        const [min, max] = range;
        return parseFloat((Math.random() * (max - min) + min).toFixed(2));
    }

    private computeSumOfPrizes(prizes: number[], from: number, to: number, total: number) {
        if (from > to) {
            return;
        }

        let totalWin = total;
        let minPrize = totalWin / (to - from + 1);
        let maxPrize = 2 * minPrize;
        for (let i = from; i <= to; i++) {
            if (totalWin <= 0.10 * total) {
                for (let j = from; j < i; j++) {
                    let sub = prizes[j] * 0.5;
                    prizes[j] -= sub;
                    totalWin += sub;
                }
            }
            let prize = minPrize + Math.random() * (maxPrize - minPrize);
            prizes[i] = parseFloat(prize.toFixed(2));
            totalWin -= prizes[i];
        }
        if (totalWin > 0) {
            totalWin /= to - from + 1;
            for (let i = from; i <= to; i++) {
                prizes[i] += totalWin;
            }
        }

        // Adjust all prizes to two decimal places and ensure their sum matches totalWin
        let roundedPrizes = prizes.slice(from, to + 1).map(prize => parseFloat(prize.toFixed(2)));
        let roundedSum = roundedPrizes.reduce((acc, val) => acc + val, 0);
        let difference = parseFloat((total - roundedSum).toFixed(2));

        // Adjust the last prize to account for the difference
        roundedPrizes[roundedPrizes.length - 1] += difference;
        roundedPrizes[roundedPrizes.length - 1] = parseFloat(roundedPrizes[roundedPrizes.length - 1].toFixed(2));

        // Update the original prizes array
        for (let i = from; i <= to; i++) {
            prizes[i] = roundedPrizes[i - from];
        }


    }


    private constructSelectionSet(totalReward: number, bet: number): number[] {
        const prizes: number[] = [];

        prizes.fill(0, 0, 6);

        let zeroIndex = -1
        if (totalReward === 0) {
            zeroIndex = 0;
        }
        else {
            zeroIndex = 1 + Math.floor(Math.random() * 5);
        }
        prizes[zeroIndex] = 0;

        this.computeSumOfPrizes(prizes, 0, zeroIndex - 1, totalReward);
        this.computeSumOfPrizes(prizes, zeroIndex + 1, 5, 0.5 * totalReward * Math.random());

        return prizes;
    }

    private async simulateDelay() {
        if (!this.skipDelay) {
            return new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}