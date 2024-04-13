import React, { useRef } from 'react';
import { Html, useGLTF } from "@react-three/drei";
import { XR } from '@react-three/xr';
import { Environment } from '@react-three/drei';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // Import OrbitControls
import { extend, useThree, useFrame } from '@react-three/fiber';
import YouTube from 'react-youtube'; // Import react-youtube
import { MeshBasicMaterial, Euler } from 'three';

// Extend OrbitControls to make it compatible with R3F
extend({ OrbitControls });

const CameraControls = () => {
    const { camera, gl } = useThree();
    const controls = useRef();

    useFrame(() => controls.current.update());

    return <orbitControls ref={controls} args={[camera, gl.domElement]} />;
};

const RoundedPlane = ({ position, size, rotation }) => {
    return (
        <mesh position={position} rotation={rotation}>
            <planeGeometry args={[size[0], size[1], 32, 32]} />
            <meshBasicMaterial color="white" transparent opacity={1} />
        </mesh>
    );
};

export default function Laptop() {
    const iframeWidth = 800; // Width of the iframe
    const iframeHeight = 352; // Height of the iframe
    const iframePosition = [-3.1, 0.02, -4.5]; // Position of the iframe
    const planeRotation = new Euler(-0.25, 0, 0); // Plane rotation

    const laptop = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/macbook/model.gltf');

    return (
        <XR>
            <Environment preset="park" background />
            <primitive object={laptop.scene} position={[0, -1.5, -3]} />
            <Html wrapperClass="laptop"
                position={[0, 0.02, -4.5]} // Adjusted position for the first iframe
                transform
                distanceFactor={1.2}
                rotation-x={-0.25}
            >
                <iframe src="https://desk-vr-viewer.onrender.com/" />
            </Html>
            <Html wrapperClass="laptop"
                position={[3.1, 0.02, -4.5]} // Adjusted position for the second iframe
                transform
                distanceFactor={1.2}
                rotation-x={-0.25}
            >
                <YouTube videoId="M2QTwirp-B8" />
            </Html>
            <Html wrapperClass="laptop"
                position={iframePosition} // Adjusted position for the third iframe
                transform
                distanceFactor={1.2}
                rotation-x={-0.25}
            >
                <iframe src="https://open.spotify.com/embed/playlist/2GhYIVzJQCPZnEcqXBXnIw?utm_source=generator" width={iframeWidth} height={iframeHeight} frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
            </Html>
            <RoundedPlane position={iframePosition} size={[iframeWidth / 265, iframeHeight / 172.5]} rotation={planeRotation} />
            <CameraControls />
        </XR>
    );
}
