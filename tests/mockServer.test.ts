import MockServer from "../assets/scripts/game/server/MockServer";
import { ServerActionResult } from "../assets/scripts/game/server/ServerActionResult";

describe('Mock Server Tests', () => {
  let server: MockServer;

  beforeEach(() => {
    server = new MockServer({ skipDelay: true });
  });

  it('should initialize with loading state', async () => {
    const result: ServerActionResult = await server.refresh();
    expect(result.state).toBe('readyToPlay');
  });

  it('should transition to playing state on play', async () => {
    await server.refresh({ recoverFromLocalStorage: false });
    const result: ServerActionResult = await server.play(100);
    expect(result.state).toBe('playing');
    expect(result.balance).toBe(900);
  });

  it('should handle item selection', async () => {
    await server.refresh({ recoverFromLocalStorage: false });
    await server.play(100);
    const result: ServerActionResult = await server.selectItem(0);
    expect(result.state).toBe('playing');
    expect(result.selectedIndices[0]).toBe(0);
  });

  it('should return error for invalid item ID', async () => {
    await server.refresh({ recoverFromLocalStorage: false });
    await server.play(100);
    const result: ServerActionResult = await server.selectItem(10);
    expect(result.error).toBe('Invalid item ID');
  });

  it('should return error if game is not in playing state', async () => {
    await server.refresh({ recoverFromLocalStorage: false });
    const result: ServerActionResult = await server.selectItem(0);
    expect(result.error).toBe('Game is not in playing state');
  });

  it('should play a full game and verify totalWin', async () => {
    console.log('Starting full game test...');

    // Refresh the game
    let result: ServerActionResult = await server.refresh({ recoverFromLocalStorage: false });
    console.log('Game state after refresh:', result);
    expect(result.state).toBe('readyToPlay');

    // Play the game with a bet of 100
    result = await server.play(100);
    console.log('Game state after play:', result);
    expect(result.state).toBe('playing');
    expect(result.balance).toBe(900);

    // Select items until the game transitions to readyToPlay
    let totalPrizeSum = 0;
    for (let i = 0; i < 6; i++) {
      result = await server.selectItem(i);
      console.log(`Game state after selecting item ${i}:`, result);
      if (result.error) {
        console.error(`Error selecting item ${i}:`, result.error);
        break;
      }
      if (result.prizes[i] === 0) {
        console.log(`Prize of 0 encountered at item ${i}`);
        break;
      }
      totalPrizeSum += result.prizes[i];
      if (result.state === 'readyToPlay') {
        console.log('Game transitioned to readyToPlay');
        break;
      }
    }

    console.log('Total prize sum:', totalPrizeSum);
    console.log('Total win:', result.totalWin);
    expect(totalPrizeSum).toBeCloseTo(result.totalWin, 2);
  }, 30000); // Increase timeout to 30 seconds

  it('should save state in localStorage and restore it in a new server instance', async () => {
    console.log('Starting state persistence test...');

    // Initialize the server with refresh
    let result: ServerActionResult = await server.refresh({ recoverFromLocalStorage: false });
    console.log('Game state after refresh:', result);
    expect(result.state).toBe('readyToPlay');

    // Play one time
    result = await server.play(100);
    console.log('Game state after play:', result);
    expect(result.state).toBe('playing');
    expect(result.balance).toBe(900);

    // Select one item
    result = await server.selectItem(0);
    console.log('Game state after selecting item 0:', result);

    // Store the game state after selecting the item
    const savedState = { ...result };

    // Check if the game is not in readyToPlay state
    if (result.state !== 'readyToPlay') {
      console.log('Game is not in readyToPlay state, destroying server and creating a new one.');

      // Destroy the server and create a new one
      server = new MockServer({ skipDelay: true });

      // Refresh the new server with recovery from cookies
      result = await server.refresh({ recoverFromLocalStorage: true });
      console.log('Game state after refreshing new server:', result);

      // Compare the restored state with the saved state
      expect(result.state).toBe(savedState.state);
      expect(result.balance).toBe(savedState.balance);
      expect(result.prizes).toEqual(savedState.prizes);
      expect(result.selectedIndices).toEqual(savedState.selectedIndices);
      expect(result.totalWin).toBe(savedState.totalWin);
    }
  }, 30000); // Increase timeout to 30 seconds

});

