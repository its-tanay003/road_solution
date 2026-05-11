import { useEffect, useCallback, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { useMLStore, type TrainingExample } from '../store/mlStore';

const SEED_DATA: TrainingExample[] = [
  { features: [12.4, 140, 88, 0, 19, 1], label: [1, 0, 0, 0], timestamp: Date.now() }, // critical
  { features: [4.2, 95, 96, 1, 14, 0], label: [0, 0, 1, 0], timestamp: Date.now() },   // moderate
  { features: [8.5, 120, 92, 0.5, 22, 1], label: [0, 1, 0, 0], timestamp: Date.now() }, // serious
  { features: [1.5, 75, 98, 1, 10, 0], label: [0, 0, 0, 1], timestamp: Date.now() },   // minor
];

// Generate more synthetic data to make the initial training meaningful
for (let i = 0; i < 46; i++) {
  const severity = Math.floor(Math.random() * 4);
  const labels = [0, 0, 0, 0];
  labels[severity] = 1;
  
  let features: number[];
  if (severity === 0) features = [10 + Math.random() * 5, 130 + Math.random() * 30, 85 + Math.random() * 5, 0, Math.random() * 24, 1];
  else if (severity === 1) features = [5 + Math.random() * 5, 100 + Math.random() * 30, 90 + Math.random() * 5, 0.3, Math.random() * 24, 1];
  else if (severity === 2) features = [2 + Math.random() * 3, 80 + Math.random() * 20, 94 + Math.random() * 4, 0.7, Math.random() * 24, 0];
  else features = [0.5 + Math.random() * 1.5, 65 + Math.random() * 15, 97 + Math.random() * 2, 1, Math.random() * 24, 0];
  
  SEED_DATA.push({ features, label: labels, timestamp: Date.now() });
}

export const useContinuousLearning = () => {
  const { 
    trainingData, 
    addTrainingExample, 
    updateAccuracy, 
    setLastRetrained, 
    examplesSinceLastRetrain,
    resetExamplesSinceRetrain,
    setIsTraining 
  } = useMLStore();
  
  const modelRef = useRef<tf.Sequential | null>(null);

  const initModel = useCallback(async () => {
    let model: tf.Sequential;
    
    try {
      // Try to load existing model from IndexedDB
      const loadedModel = await tf.loadLayersModel('indexeddb://roadsos-model');
      model = loadedModel as tf.Sequential;
      console.log('Model loaded from IndexedDB');
    } catch {
      // Create new model if none exists
      console.log('Creating new model');
      model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [6], units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 4, activation: 'softmax' })
        ]
      });
    }

    model.compile({ 
      optimizer: tf.train.adam(), 
      loss: 'categoricalCrossentropy', 
      metrics: ['accuracy'] 
    });
    
    modelRef.current = model;
    return model;
  }, []);

  const train = useCallback(async (data: TrainingExample[], epochs = 50) => {
    if (!modelRef.current) return;
    
    setIsTraining(true);
    
    const xs = tf.tensor2d(data.map(d => d.features));
    const ys = tf.tensor2d(data.map(d => d.label));

    const history = await modelRef.current.fit(xs, ys, {
      epochs,
      batchSize: 8,
      shuffle: true,
      callbacks: {
        onEpochEnd: (_, logs) => {
          if (logs && logs.acc) {
            updateAccuracy(parseFloat((logs.acc * 100).toFixed(1)));
          }
        }
      }
    });

    // Save model after training
    await modelRef.current.save('indexeddb://roadsos-model');

    xs.dispose();
    ys.dispose();
    
    setLastRetrained(Date.now());
    setIsTraining(false);
    return history;
  }, [setIsTraining, updateAccuracy, setLastRetrained]);

  useEffect(() => {
    const setup = async () => {
      if (!modelRef.current) {
        await initModel();
        
        // If no data in store, seed it and train
        if (trainingData.length === 0) {
          SEED_DATA.forEach(ex => addTrainingExample(ex));
          await train(SEED_DATA);
        } else {
          // Just train on existing data to refine
          await train(trainingData, 10);
        }
      }
    };
    
    setup();
  }, [initModel, train, addTrainingExample, trainingData]);

  // Handle periodic retraining
  useEffect(() => {
    if (examplesSinceLastRetrain >= 5) {
      train(trainingData, 20);
      resetExamplesSinceRetrain();
    }
  }, [examplesSinceLastRetrain, trainingData, train, resetExamplesSinceRetrain]);

  const predict = useCallback((features: number[]) => {
    if (!modelRef.current) return null;
    
    return tf.tidy(() => {
      const input = tf.tensor2d([features]);
      const prediction = modelRef.current!.predict(input) as tf.Tensor;
      return prediction.dataSync();
    });
  }, []);

  return { predict, train };
};
