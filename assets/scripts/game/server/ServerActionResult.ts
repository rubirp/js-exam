export interface ServerActionResult {
    sessionNumber: number;
    state: 'loading' | 'readyToPlay' | 'playing';
    balance: number;
    prizes: number[];
    selectedIndices: number[];
    totalWin: number;
    allowedBets: number[]; // Add allowedBets
    currentBet: number; // Add currentBet
    error?: string;
}

export interface ServerInterface {
    refresh(options?:any): Promise<ServerActionResult>;
    play(bet: number): Promise<ServerActionResult>;
    selectItem(itemId: number): Promise<ServerActionResult>;
}
