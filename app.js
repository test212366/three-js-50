import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' 
import GUI from 'lil-gui'
import gsap from 'gsap'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
 
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'




export default class Sketch {
	constructor(options) {
		
		this.scene = new THREE.Scene()
		
		this.container = options.dom
		
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		
		
		// // for renderer { antialias: true }
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
		this.renderer.setSize(this.width ,this.height )
		this.renderer.setClearColor(0xeeeeee, 1)
		this.renderer.useLegacyLights = true
		this.renderer.outputEncoding = THREE.sRGBEncoding
 

		 
		this.renderer.setSize( window.innerWidth, window.innerHeight )

		this.container.appendChild(this.renderer.domElement)
 


		this.camera = new THREE.PerspectiveCamera( 70,
			 this.width / this.height,
			 0.01,
			 10
		)
 
		this.camera.position.set(0, 0, 2) 
		// this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.time = 0


		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
		this.gltf = new GLTFLoader()
		this.gltf.setDRACOLoader(this.dracoLoader)
		this.wrap = document.getElementById('wrap')

		this.isPlaying = true

		this.rounded = 0
		this.speed = 0
		this.position = 0
		this.elems = [...document.querySelectorAll('.n')]
		this.objs = Array(5).fill({dist: 0})
		this.block = document.getElementById('block')
		window.addEventListener('wheel', (e) => {
 
			this.speed += e.deltaY * 0.0003
		})
		this.materials = []
		this.meshes = []
 


		this.addObjects()		 
		this.resize()
		this.render()
		this.setupResize()
		this.handleImages()

 
	}
	handleImages() {
		let images = [...document.querySelectorAll('img')]
		
		images.forEach((im, i) => {
			let mat = this.material.clone()
			this.materials.push(mat)
			mat.uniforms.texture1.value = new THREE.Texture(im)
			mat.uniforms.texture1.value.needsUpdate = true
			 
			let geo = new THREE.PlaneGeometry(1.5, 1, 20, 20)
			let mesh = new THREE.Mesh(geo, mat)
			this.meshes.push(mesh)
			this.scene.add(mesh)
			mesh.position.y = i * 1.2
			mesh.rotation.y = -.5
			mesh.rotation.x = -.3
			mesh.rotation.z = -.1

			
 


		})
	}

	settings() {
		let that = this
		this.settings = {
			progress: 0
		}
		this.gui = new GUI()
		this.gui.add(this.settings, 'progress', 0, 1, 0.01)
	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	resize() {
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height


		this.imageAspect = 853/1280
		let a1, a2
		if(this.height / this.width > this.imageAspect) {
			a1 = (this.width / this.height) * this.imageAspect
			a2 = 1
		} else {
			a1 = 1
			a2 = (this.height / this.width) / this.imageAspect
		} 


		this.material.uniforms.resolution.value.x = this.width
		this.material.uniforms.resolution.value.y = this.height
		this.material.uniforms.resolution.value.z = a1
		this.material.uniforms.resolution.value.w = a2

		this.camera.updateProjectionMatrix()



	}


	addObjects() {
		let that = this
		this.material = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
		 
			uniforms: {
				time: {value: 0},
				texture1: {value: null},
				distancef: {value: 0},
				resolution: {value: new THREE.Vector4()}
			},
			transparent: true,
			vertexShader,
			fragmentShader
		})
		
		this.geometry = new THREE.PlaneGeometry(1,1,1,1)
		// this.plane = new THREE.Mesh(this.geometry, this.material)
 
		// this.scene.add(this.plane)
 
	}



	addLights() {
		const light1 = new THREE.AmbientLight(0xeeeeee, 0.5)
		this.scene.add(light1)
	
	
		const light2 = new THREE.DirectionalLight(0xeeeeee, 0.5)
		light2.position.set(0.5,0,0.866)
		this.scene.add(light2)
	}

	stop() {
		this.isPlaying = false
	}

	play() {
		if(!this.isPlaying) {
			this.isPlaying = true
			this.render()
		}
	}

	render() {
		if(!this.isPlaying) return
		this.time += 0.05
		this.material.uniforms.time.value = this.time


		this.position += this.speed
		this.speed *= 0.8
		this.rounded = Math.round(this.position)


		
		
		this.diff = (this.rounded - this.position)
		this.objs.forEach((o,i) => {
			o.dist = Math.min(Math.abs(this.position - i),1)
			o.dist = 1 - o.dist ** 2
			this.elems[i].style.transform = `scale(${1 + 0.4 * o.dist})`

			const s = 1 + 0.1 * o.dist
			 
			if(this.meshes && this.meshes[i]) {
				this.meshes[i].position.y = i * 1.2 - this.position * 1.2
				this.meshes[i].scale.set(s,s,s) 
				this.meshes[i].material.uniforms.distancef.value = o.dist
			}
		 
		  

		})
		if(this.materials) {
			this.materials.forEach(m => {
				m.uniforms.time.value = this.time
			})
		}
		 

		this.position += Math.sign(this.diff) * Math.pow(Math.abs(this.diff), 0.7) * 0.035

		this.wrap.style.transform = `translate(0, ${-this.position * 100 + 50}px)`
		//this.renderer.setRenderTarget(this.renderTarget)
		this.renderer.render(this.scene, this.camera)
		//this.renderer.setRenderTarget(null)
	 
		requestAnimationFrame(this.render.bind(this))
	}
 
}
new Sketch({
	dom: document.getElementById('container')
})
let attractMode = false
 

let navs = [...document.querySelectorAll('li')]

let nav = document.querySelector('.nav')

nav.addEventListener('mouseenter', () => {
	attractMode = true
})

nav.addEventListener('mouseleave', () => {
	attractMode = false
})

navs.forEach(el => {
	el.addEventListener('mouseover', (e) => {

	})
})