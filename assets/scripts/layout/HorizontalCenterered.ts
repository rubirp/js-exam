const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class HorizontalCentered extends cc.Component {

    @property(cc.Float)
    xspace: number = 0;

    onLoad() {
        this.updateLayout();
    }

    updateLayout() {
        const children = this.node.children;
        if (children.length === 0) return;

        // Calculate the total width of all children including spacing
        let totalWidth = 0;
        children.forEach(child => {
            totalWidth += child.width;
        });
        totalWidth += this.xspace * (children.length - 1);

        // Calculate the starting x position
        let startX = -totalWidth / 2;

        // Position each child node
        children.forEach(child => {
            child.x = startX + child.width / 2;
            startX += child.width + this.xspace;
        });
    }

    onEnable() {
        this.updateLayout();
    }

    update() {
        this.updateLayout();
    }
}