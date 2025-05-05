export class LSystem {
    constructor(axiom, rules, iterations) {
        this.axiom = axiom;
        this.rules = rules;
        this.iterations = iterations;
    }

    generate() {
        let current = this.axiom;
        for (let i = 0; i < this.iterations; i++) {
            current = current.split('').map(c => this.rules[c] || c).join('');
        }
        return current;
    }
}
