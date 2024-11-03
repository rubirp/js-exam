import { ReactiveVariable } from "../../utils/ReactiveVariable";


export enum PickerItemStateType {
    IDLE,
    SELECTED,
    OPENED
}

export enum PickerItemSubStateType {
    NONE,
    EMPTY,
    WITH_PRIZE,
    REVEALED,
    CHOSEN
}

export default class PickerItem {

    private static selecting: boolean = false; // FB-05

    private currentState: ReactiveVariable<PickerItemStateType>;
    private currentSubState: ReactiveVariable<PickerItemSubStateType>;
    private isDisabled: ReactiveVariable<boolean>;
    private prize: ReactiveVariable<number | null>;

    constructor(
        prize: number | null = null,
        gameState: 'loading' | 'readyToPlay' | 'playing' = 'loading'
    ) {
        this.prize = new ReactiveVariable<number | null>(prize);
        this.isDisabled = new ReactiveVariable<boolean>(gameState !== 'playing' || prize === null);
        this.currentState = new ReactiveVariable<PickerItemStateType>(this.computeState(gameState));
        this.currentSubState = new ReactiveVariable<PickerItemSubStateType>(this.computeSubState());
    }

    private computeState(gameState: 'loading' | 'readyToPlay' | 'playing'): PickerItemStateType {
        if (this.prize.value !== null) {
            this.isDisabled.value = true;
            return PickerItemStateType.OPENED;
        } else {
            this.isDisabled.value = gameState !== 'playing';
            return PickerItemStateType.IDLE;
        }
    }

    private computeSubState(): PickerItemSubStateType {
        if (this.currentState.value === PickerItemStateType.OPENED) {
            return this.prize.value !== null ? PickerItemSubStateType.WITH_PRIZE : PickerItemSubStateType.EMPTY;
        }
        return PickerItemSubStateType.NONE;
    }

    getState(): ReactiveVariable<PickerItemStateType> {
        return this.currentState;
    }

    getSubState(): ReactiveVariable<PickerItemSubStateType> {
        return this.currentSubState;
    }

    isItemDisabled(): ReactiveVariable<boolean> {
        return this.isDisabled;
    }

    getPrize(): ReactiveVariable<number | null> {
        return this.prize;
    }

    setState(state: PickerItemStateType) {
        if (!this.isDisabled.value) {
            this.currentState.value = state;
            this.currentSubState.value = this.computeSubState();
        }
    }

    setSubState(subState: PickerItemSubStateType) {
        if (!this.isDisabled.value && this.currentState.value === PickerItemStateType.OPENED) {
            this.currentSubState.value = subState;
        } else {
            console.error("SubState can only be set when the state is OPENED and the item is not disabled.");
        }
    }

    enable() {
        this.isDisabled.value = false;
    }

    disable() {
        this.isDisabled.value = true;
    }

    select() {
        if(PickerItem.selecting) return;  // FB-05

        if (!this.isDisabled.value) {
            PickerItem.selecting = true; // FB-05

            this.setState(PickerItemStateType.SELECTED);
            this.disable();
        }
    }

    open(prize: number | null, isChosen: boolean) {
        if (!this.isDisabled.value) {
            this.setState(PickerItemStateType.OPENED);
            if (prize !== null) {
                this.prize.value = prize;
                this.setSubState(isChosen ? PickerItemSubStateType.CHOSEN : PickerItemSubStateType.REVEALED);
            } else {
                this.setSubState(PickerItemSubStateType.EMPTY);
            }
        }
    }

    reset() {
        if (this.currentState.value === PickerItemStateType.OPENED) {
            this.setState(PickerItemStateType.IDLE);
            this.currentSubState.value = PickerItemSubStateType.NONE;
            this.prize.value = null;
        }
    }
}