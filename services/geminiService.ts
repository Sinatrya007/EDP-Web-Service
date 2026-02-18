
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AIAnalysisResult, KTPAnalysisResult } from "../types";

/**
 * Analyzes a KTP image to extract identity details.
 */
export const analyzeKTPDocument = async (base64Image: string): Promise<KTPAnalysisResult> => {
  // Always initialize a new GoogleGenAI instance right before use to ensure the latest API key is utilized.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: "Extract information from this Indonesian Identity Card (KTP). Provide details in JSON format. Identify: Full Name (Nama), NIK (16 digits), and Address (Alamat).",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          nik: { type: Type.STRING },
          address: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
        },
        required: ["name", "nik", "address"],
      },
    },
  });

  // Access the text property directly; do not call as a method text().
  const jsonStr = response.text?.trim();
  return JSON.parse(jsonStr || '{}');
};

/**
 * Analyzes an SK document image to extract vehicle recovery details.
 */
export const analyzeSKDocument = async (base64Image: string): Promise<AIAnalysisResult> => {
  // Always initialize a new GoogleGenAI instance right before use to ensure the latest API key is utilized.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: "Extract information from this Vehicle Recovery Order (SK). Provide details in JSON format. Identify: Leasing Name, Vehicle Model/Name, Plate Number, Debtor Name, Debtor Address, Contract Number (Nomor Kontrak), Chassis Number (Noka), Engine Number (Nosin), and Vehicle Year (Tahun Pembuatan).",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          leasingName: { type: Type.STRING },
          vehicleModel: { type: Type.STRING },
          plateNumber: { type: Type.STRING },
          debtorName: { type: Type.STRING },
          debtorAddress: { type: Type.STRING },
          contractNumber: { type: Type.STRING },
          chassisNumber: { type: Type.STRING },
          engineNumber: { type: Type.STRING },
          vehicleYear: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
        },
        required: ["leasingName", "vehicleModel", "plateNumber", "debtorName", "debtorAddress"],
      },
    },
  });

  // Access the text property directly; do not call as a method text().
  const jsonStr = response.text?.trim();
  return JSON.parse(jsonStr || '{}');
};

/**
 * Uses Google Search to find current market price for a vehicle.
 */
export const searchVehicleMarketPrice = async (vehicleModel: string) => {
  // Always initialize a new GoogleGenAI instance right before use to ensure the latest API key is utilized.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Berapa kisaran harga jual kembali mobil ${vehicleModel} di Indonesia saat ini? Berikan ringkasan singkat.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return {
    // Access the text property directly; do not call as a method text().
    text: response.text,
    sources: groundingSources
  };
};
