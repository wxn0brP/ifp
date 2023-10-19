class scenaC{
    constructor(
        txturl,
        width = window.innerWidth,
        height = window.innerHeight,
        doc = document.body
    ){
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        doc.appendChild(renderer.domElement);

        const geometry = new THREE.CylinderGeometry(0, 4, 5, 4, 0);

        geometry.faceVertexUvs[0] = [
            [new THREE.Vector2(0, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0.25, 0.5)],
            [new THREE.Vector2(0.25, 0.5), new THREE.Vector2(0.75, 0.5), new THREE.Vector2(0.5, 0)],
            [new THREE.Vector2(0.5, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0.75, 0.5)],
            [new THREE.Vector2(0.25, 0.5), new THREE.Vector2(0.75, 0.5), new THREE.Vector2(0.5, 1)],
        ];

        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(txturl);

        const materials = [
            new THREE.MeshBasicMaterial({ map: texture }),
            new THREE.MeshBasicMaterial({ map: texture }),
            new THREE.MeshBasicMaterial({ map: texture }),
            new THREE.MeshBasicMaterial({ map: texture }),
            new THREE.MeshBasicMaterial({ map: texture })
        ];

        const pyramid = new THREE.Mesh(geometry, materials);
        scene.add(pyramid);

        camera.position.z = 10;
        camera.position.y = 2;
        camera.rotation.x = -0.3;

        let speed = 0.05;
        function render(){
            requestAnimationFrame(render);
            pyramid.rotation.x += 0.00;
            pyramid.rotation.y += speed;

            renderer.render(scene, camera);
        }
        this.render = () => {
            render();
            return this;
        }
        this.speed = (s) => {
            speed = s/100;
            return this;
        }
        this.resize = function(w, h){
            width = w;
            height = h;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            return this;
        }
        this.setBg = function(color){
            scene.background = new THREE.Color(color);
            return this;
        }
    }
}