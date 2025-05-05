import * as THREE from 'three';

export class Turtle3D {
    constructor(angle, length, startSystemRadius = 2, endSystemRadius = 0.01) {
        this.angle = angle;
        this.length = length;
        this.stack = [];
        this.position = new THREE.Vector3();
        this.orientation = new THREE.Quaternion(); 
        this.geometryData = [];
        this.startSystemRadius = startSystemRadius;
        this.endSystemRadius = endSystemRadius;
    }

    interpret(str) {
        this.geometryData = [];
        this.position.set(0, 0, 0);
        this.orientation.identity();
        this.stack = [];
        this.maxLineOfSegments = 0;
        this.tempNum = [];
        for (let i = str.length - 1; i >= 0; i--) {
            const char = str[i];
            if (char.match(/[A-Z]/)) {
                this.tempNum.unshift(this.maxLineOfSegments);
                this.maxLineOfSegments++;
            } else if (char == '['){
                let r = this.stack.pop();
                this.maxLineOfSegments = Math.max(r, this.maxLineOfSegments);
            } else if (char == ']'){
                this.stack.push(this.maxLineOfSegments);
                this.maxLineOfSegments = 0;
            }
        }
        this.maxLineOfSegments = Math.max(...this.tempNum);
        for (let i = 0; i < this.tempNum.length; i++){
            this.tempNum[i] = this.maxLineOfSegments - this.tempNum[i];
        }
        this.radiusId = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            if (char.match(/[A-Z]/)) {
                // Движение с рисованием
                const dir = new THREE.Vector3(0, 1, 0).applyQuaternion(this.orientation);
                const newPos = this.position.clone().add(dir.multiplyScalar(this.length));
                this.geometryData.push({
                    from: this.position.clone(),
                    to: newPos.clone(),
                    startRadius: this.startSystemRadius + this.tempNum[this.radiusId] * (this.endSystemRadius - this.startSystemRadius) / this.maxLineOfSegments,
                    endRadius: this.startSystemRadius + (this.tempNum[this.radiusId]+1) * ((this.endSystemRadius - this.startSystemRadius) / this.maxLineOfSegments),
                });
                this.position.copy(newPos);
                this.radiusId++;



            } else if (char.match(/[a-z]/)) {
                // Движение без рисования
                const dir = new THREE.Vector3(0, 1, 0).applyQuaternion(this.orientation);
                const newPos = this.position.clone().add(dir.multiplyScalar(this.length));
                this.position.copy(newPos);
            } else {
                const H = new THREE.Vector3(0, 0, 1).applyQuaternion(this.orientation);
                const L = new THREE.Vector3(1, 0, 0).applyQuaternion(this.orientation);
                const U = new THREE.Vector3(0, 1, 0).applyQuaternion(this.orientation);
                let n = () => {return 1};//Math.random()*2;
                switch (char) {
                    case '+': this._rotate(U, this.angle); break;  // поворот вокруг U (влево)
                    case '-': this._rotate(U, -this.angle); break; // поворот вокруг U (вправо)
                    case '^': this._rotate(L, this.angle); break;  // наклон вокруг L (вверх)
                    case '&': this._rotate(L, -this.angle); break; // наклон вокруг L (вниз)
                    case '/': this._rotate(H, this.angle); break;  // крен вокруг H (влево)
                    case '*': this._rotate(H, -this.angle); break; // крен вокруг H (вправо)
                    case '|': this._rotate(H, Math.PI); break;
                    case '[':
                        this.stack.push({
                            position: this.position.clone(),
                            orientation: this.orientation.clone(),
                        });
                        break;
                    case ']':
                        if (this.stack.length > 0) {
                            const state = this.stack.pop();
                            this.position.copy(state.position);
                            this.orientation.copy(state.orientation);
                        } else {
                            console.warn("Turtle3D: Stack underflow on ']'");
                        }
                        break;
                }
            }
        }
        return this.geometryData;
    }

    _rotate(axis, angle) {
        const q = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        this.orientation.premultiply(q);
    }
}
