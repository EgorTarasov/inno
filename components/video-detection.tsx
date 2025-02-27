"use client"

import { useRef, useEffect, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as cocossd from '@tensorflow-models/coco-ssd'
import ReactPlayer from 'react-player/lazy'
import { Settings, X } from 'lucide-react'

interface VideoDetectionProps {
    url: string
    width: string | number
    height: string | number
    playing?: boolean
    controls?: boolean
}

type ModelType = 'coco-ssd' | 'custom'

interface CustomModelConfig {
    modelUrl: string
    inputSize: number
    classLabels: string[]
    confidenceThreshold: number
}

export default function VideoDetection({
    url,
    width,
    height,
    playing = false,
    controls = true
}: VideoDetectionProps) {
    const playerRef = useRef<ReactPlayer>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Model state
    const [model, setModel] = useState<cocossd.ObjectDetection | tf.GraphModel | null>(null)
    const [modelType, setModelType] = useState<ModelType>('coco-ssd')
    const [detectionActive, setDetectionActive] = useState(false)
    const [showSettings, setShowSettings] = useState(false)

    // Custom model configuration
    const [customModelConfig, setCustomModelConfig] = useState<CustomModelConfig>({
        modelUrl: '',
        inputSize: 416, // Default for many YOLO models
        classLabels: [],
        confidenceThreshold: 0.5
    })

    // Class labels input as string for UI
    const [classLabelsInput, setClassLabelsInput] = useState('')
    const [isModelLoading, setIsModelLoading] = useState(false)
    const [modelLoadError, setModelLoadError] = useState<string | null>(null)

    // Load the model on component mount or when model type changes
    useEffect(() => {
        async function loadModel() {
            setIsModelLoading(true)
            setModelLoadError(null)
            try {
                await tf.ready()
                let loadedModel;

                if (modelType === 'coco-ssd') {
                    loadedModel = await cocossd.load()
                    console.log("COCO-SSD model loaded")
                } else if (modelType === 'custom' && customModelConfig.modelUrl) {
                    loadedModel = await tf.loadGraphModel(customModelConfig.modelUrl)
                    console.log("Custom model loaded")
                }

                setModel(loadedModel)
                setIsModelLoading(false)
            } catch (error) {
                console.error("Error loading model:", error)
                setModelLoadError(`Failed to load model: ${error instanceof Error ? error.message : String(error)}`)
                setIsModelLoading(false)
            }
        }

        if (modelType === 'coco-ssd' || (modelType === 'custom' && customModelConfig.modelUrl)) {
            loadModel()
        }
    }, [modelType, customModelConfig.modelUrl])

    // Handle custom model detection
    async function detectWithCustomModel(video: HTMLVideoElement): Promise<Array<{
        bbox: [number, number, number, number];
        class: string;
        score: number;
    }>> {
        if (!model || !(model instanceof tf.GraphModel)) return []

        // Get video dimensions
        const videoWidth = video.videoWidth
        const videoHeight = video.videoHeight

        // Convert video frame to tensor
        const inputSize = customModelConfig.inputSize
        const tensor = tf.tidy(() => {
            // Create tensor from video element
            const img = tf.browser.fromPixels(video)

            // Resize to model input size
            const resized = tf.image.resizeBilinear(img, [inputSize, inputSize])

            // Normalize pixel values to [0, 1]
            const normalized = tf.div(resized, 255)

            // Add batch dimension [1, inputSize, inputSize, 3]
            return normalized.expandDims(0)
        })

        // Run inference
        const predictions = await model.predict(tensor) as tf.Tensor | tf.Tensor[]

        // Clean up tensor
        tensor.dispose()

        // Process predictions based on model output format
        // This is a simplified example - actual processing depends on specific model output format
        const detections = await processCustomModelOutput(predictions, videoWidth, videoHeight)

        return detections
    }

    // Process custom model output - this needs to be adapted for specific model architecture
    async function processCustomModelOutput(output: tf.Tensor | tf.Tensor[], originalWidth: number, originalHeight: number) {
        // This is a placeholder implementation - actual processing depends on model output format
        // Example assuming YOLOv5-like output structure
        let boxes: number[][] = []
        let scores: number[] = []
        let classes: number[] = []

        try {
            const outputArray = output instanceof Array ? output[0] : output
            const outputData = await outputArray.array() as number[][]

            // Process each detection
            outputData[0].forEach((detection) => {
                // Assuming format: [x, y, width, height, confidence, class1, class2, ...]
                const xCenter = detection[0] * originalWidth
                const yCenter = detection[1] * originalHeight
                const width = detection[2] * originalWidth
                const height = detection[3] * originalHeight
                const confidence = detection[4]

                // Find class with highest probability (starting from index 5)
                const classScores = detection.slice(5)
                const classIndex = classScores.indexOf(Math.max(...classScores))

                if (confidence >= customModelConfig.confidenceThreshold) {
                    // Convert center coordinates to top-left coordinates
                    const x = xCenter - width / 2
                    const y = yCenter - height / 2

                    boxes.push([x, y, width, height])
                    scores.push(confidence)
                    classes.push(classIndex)
                }
            })

            // Cleanup tensors
            if (output instanceof Array) {
                output.forEach(t => t.dispose())
            } else {
                output.dispose()
            }
        } catch (error) {
            console.error("Error processing model output:", error)

            // Cleanup tensors
            if (output instanceof Array) {
                output.forEach(t => t.dispose())
            } else {
                output.dispose()
            }

            return []
        }

        // Convert to format compatible with our renderer
        return boxes.map((box, i) => ({
            bbox: box as [number, number, number, number],
            class: customModelConfig.classLabels[classes[i]] || `Class ${classes[i]}`,
            score: scores[i]
        }))
    }

    // Detection process
    useEffect(() => {
        if (!model || !playerRef.current || !canvasRef.current) return

        let animationFrameId: number
        let videoElement: HTMLVideoElement | null = null

        // Find the video element in the ReactPlayer
        setTimeout(() => {
            const playerElement = playerRef.current?.getInternalPlayer()
            if (playerElement instanceof HTMLVideoElement) {
                videoElement = playerElement

                if (detectionActive) {
                    runDetection()
                }
            }
        }, 1000) // Give time for video to initialize

        async function runDetection() {
            if (!videoElement || !canvasRef.current || !model) return

            if (videoElement.readyState === 4) { // HAVE_ENOUGH_DATA
                const canvas = canvasRef.current
                const ctx = canvas.getContext('2d')

                if (ctx) {
                    // Set canvas dimensions
                    canvas.width = videoElement.videoWidth
                    canvas.height = videoElement.videoHeight

                    // Make predictions based on model type
                    const predictions = modelType === 'coco-ssd'
                        ? await (model as cocossd.ObjectDetection).detect(videoElement)
                        : await detectWithCustomModel(videoElement)

                    // Draw video frame on canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height)

                    // Draw detection boxes
                    predictions.forEach(prediction => {
                        const [x, y, width, height] = prediction.bbox

                        // Draw bounding box
                        ctx.strokeStyle = '#00FFFF'
                        ctx.lineWidth = 2
                        ctx.strokeRect(x, y, width, height)

                        // Draw label background
                        ctx.fillStyle = '#00FFFF'
                        const text = prediction.class + (prediction.score ? ` ${Math.round(prediction.score * 100)}%` : '')
                        const textWidth = ctx.measureText(text).width
                        ctx.fillRect(x, y - 20, textWidth + 10, 20)

                        // Draw label text
                        ctx.fillStyle = '#000000'
                        ctx.font = '16px Arial'
                        ctx.fillText(text, x + 5, y - 5)
                    })
                }
            }

            animationFrameId = requestAnimationFrame(runDetection)
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId)
            }
        }
    }, [model, detectionActive, modelType, customModelConfig])

    // Handle form submission for custom model
    const handleModelConfigSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Parse class labels
        const labels = classLabelsInput
            .split(',')
            .map(label => label.trim())
            .filter(Boolean)

        setCustomModelConfig(prev => ({
            ...prev,
            classLabels: labels
        }))

        setModelType('custom')
        setShowSettings(false)
    }

    return (
        <div className="relative" style={{ width, height }}>
            <ReactPlayer
                ref={playerRef}
                url={url}
                width="100%"
                height="100%"
                playing={playing}
                controls={controls}
                config={{
                    file: {
                        forceHLS: true,
                    }
                }}
            />
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />

            {/* Controls */}
            <div className="absolute bottom-2 right-2 flex gap-2 z-10">
                <button
                    className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"
                    onClick={() => setShowSettings(!showSettings)}
                >
                    <Settings size={16} />
                    <span>Models</span>
                </button>
                <button
                    className={`px-3 py-1 rounded ${detectionActive ? 'bg-red-600' : 'bg-green-600'} text-white`}
                    onClick={() => setDetectionActive(prev => !prev)}
                    disabled={isModelLoading || !model}
                >
                    {isModelLoading ? 'Loading...' : detectionActive ? 'Disable Detection' : 'Enable Detection'}
                </button>
            </div>

            {/* Settings panel */}
            {showSettings && (
                <div className="absolute top-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-bl-lg shadow-lg p-4 z-20 w-80">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Model Settings</h3>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Model type selection */}
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Model Type</label>
                        <div className="flex gap-2">
                            <button
                                className={`px-3 py-1 rounded ${modelType === 'coco-ssd' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                                onClick={() => setModelType('coco-ssd')}
                            >
                                COCO-SSD (Default)
                            </button>
                            <button
                                className={`px-3 py-1 rounded ${modelType === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                                onClick={() => customModelConfig.modelUrl && setModelType('custom')}
                                disabled={!customModelConfig.modelUrl}
                            >
                                Custom Model
                            </button>
                        </div>
                    </div>

                    {modelLoadError && (
                        <div className="mb-4 p-2 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
                            {modelLoadError}
                        </div>
                    )}

                    {/* Custom model form */}
                    <form onSubmit={handleModelConfigSubmit}>
                        <div className="mb-3">
                            <label className="block mb-1 text-sm font-medium">Model URL</label>
                            <input
                                type="text"
                                value={customModelConfig.modelUrl}
                                onChange={(e) => setCustomModelConfig(prev => ({ ...prev, modelUrl: e.target.value }))}
                                placeholder="https://path/to/model.json"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block mb-1 text-sm font-medium">Input Size</label>
                            <input
                                type="number"
                                value={customModelConfig.inputSize}
                                onChange={(e) => setCustomModelConfig(prev => ({ ...prev, inputSize: Number(e.target.value) }))}
                                placeholder="416"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block mb-1 text-sm font-medium">Class Labels (comma-separated)</label>
                            <textarea
                                value={classLabelsInput}
                                onChange={(e) => setClassLabelsInput(e.target.value)}
                                placeholder="person, car, truck"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm h-20"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium">
                                Confidence Threshold: {customModelConfig.confidenceThreshold}
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="0.9"
                                step="0.05"
                                value={customModelConfig.confidenceThreshold}
                                onChange={(e) => setCustomModelConfig(prev => ({ ...prev, confidenceThreshold: Number(e.target.value) }))}
                                className="w-full"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white px-3 py-2 rounded"
                            disabled={!customModelConfig.modelUrl}
                        >
                            Apply Custom Model
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}