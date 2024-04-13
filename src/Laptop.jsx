import React, { useRef, useState, useCallback } from 'react';
import { Html, useGLTF } from "@react-three/drei";
import { XR, useXR } from '@react-three/xr';
import { Environment } from '@react-three/drei';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // Import OrbitControls
import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls'; // Import DeviceOrientationControls
import { extend, useThree, useFrame } from '@react-three/fiber';
import YouTube from 'react-youtube'; // Import react-youtube

// Extend OrbitControls to make it compatible with R3F
extend({ OrbitControls });

const CameraControls = () => {
    const { camera, gl } = useThree();
    const { isPresenting } = useXR();
    const controls = useRef();

    useFrame(() => {
        if (isPresenting) {
            // Dispose the OrbitControls when XR is presenting
            if (controls.current.dispose) controls.current.dispose();
        } else {
            // Update the controls when not presenting
            controls.current.update();
        }
    });

    return isPresenting ? null : <orbitControls ref={controls} args={[camera, gl.domElement]} />;
};

export default function Laptop() {
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
                position={[-3.1, 0.02, -4.5]} // Adjusted position for the third iframe
                transform
                distanceFactor={1.2}
                rotation-x={-0.25}
            >
                <iframe src="https://open.spotify.com/embed/playlist/2GhYIVzJQCPZnEcqXBXnIw?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
            </Html>
            <CameraControls />
        </XR>
    );
}
