import { initialWorld } from "../lib/constants";
import type { World } from "../lib/types";

class MainScreen {
    worlds!: Record<string, World>;
    mazeList: HTMLUListElement = document.querySelector("ul#world-list")!;

    constructor() {
        this.hydrate();
        this.drawWorldList();
    }

    getWorldsAsArray() {
        return Object.values(this.worlds).sort((a, b) => a.index - b.index);
    }

    goToWorldMapScreen(worldId: string) {
        location.assign(`/src/pages/02.world.html?worldId=${worldId}`);
    }

    private hydrate() {
        const storedData = localStorage.getItem("worlds");
        if (storedData) {
            this.worlds = JSON.parse(storedData);
        } else {
            this.resetGameData();
        }
    }

    private resetGameData() {
        console.log("RESET GAME DATA FROM SCRATCH");
        this.worlds = {
            [initialWorld.id]: initialWorld,
        };
        localStorage.setItem("worlds", JSON.stringify(this.worlds));
    }

    private drawWorldList() {
        const worlds = this.getWorldsAsArray();
        worlds.forEach(this.drawWorld.bind(this));
    }

    private drawWorld(world: World) {
        const li = document.createElement("li");
        li.textContent = world.name;
        li.addEventListener("click", () => this.goToWorldMapScreen(world.id));
        this.mazeList.append(li);
    }
}

const screen = new MainScreen();

console.log("main", screen);
