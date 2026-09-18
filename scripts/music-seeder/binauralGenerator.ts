import fs from 'fs';

/**
 * Generates an authentic 16-bit stereo PCM WAV file with precise binaural carrier frequencies.
 * Left ear receives (baseFreq - delta/2) and Right ear receives (baseFreq + delta/2).
 */
export function generateBinauralWavFile(
  filePath: string,
  durationSec: number = 60,
  baseFreq: number = 216,
  deltaFreq: number = 40
): number {
  const sampleRate = 44100;
  const numChannels = 2;
  const bitsPerSample = 16;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + dataSize);

  // 1. RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // 2. fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  buffer.writeUInt16LE(1, 20); // AudioFormat = 1 (PCM)
  buffer.writeUInt16LE(numChannels, 22); // NumChannels = 2 (Stereo)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate = 44100
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // ByteRate
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // BlockAlign = 4
  buffer.writeUInt16LE(bitsPerSample, 34); // BitsPerSample = 16

  // 3. data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  const leftFreq = baseFreq - deltaFreq / 2;
  const rightFreq = baseFreq + deltaFreq / 2;
  const maxAmp = 16000; // Comfortable volume amplitude to prevent any digital distortion

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Smooth envelope: 2-second linear fade-in and 2-second fade-out
    let envelope = 1.0;
    if (i < sampleRate * 2) {
      envelope = i / (sampleRate * 2);
    } else if (i > numSamples - sampleRate * 2) {
      envelope = (numSamples - i) / (sampleRate * 2);
    }

    const leftSample = Math.floor(Math.sin(2 * Math.PI * leftFreq * t) * maxAmp * envelope);
    const rightSample = Math.floor(Math.sin(2 * Math.PI * rightFreq * t) * maxAmp * envelope);

    const offset = headerSize + i * 4;
    buffer.writeInt16LE(leftSample, offset);
    buffer.writeInt16LE(rightSample, offset + 2);
  }

  fs.writeFileSync(filePath, buffer);
  return buffer.length;
}
