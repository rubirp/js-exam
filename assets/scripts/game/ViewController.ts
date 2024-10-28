import { ReactiveVariable } from "../utils/ReactiveVariable";

const { ccclass } = cc._decorator;

@ccclass
export default class ViewController<T> extends cc.Component {

    model: ReactiveVariable<T> = new ReactiveVariable<T>(null);
}