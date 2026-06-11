import { appwriteConfig, functions } from "@/lib/appwrite";
import { ExecutionMethod } from "react-native-appwrite";

type SignaturePayload = {
  timestamp: number;
  signature: string;
  folder?: string;
};

const parseExecutionResponseBody = (raw: unknown): Record<string, unknown> => {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") return raw as Record<string, unknown>;
  return {};
};

const getCloudinarySignedUploadPayload = async (
  folder: string
): Promise<SignaturePayload> => {
  if (!appwriteConfig.cloudinarySignFunctionId) {
    throw new Error("Hiányzik az EXPO_PUBLIC_CLOUDINARY_SIGN_FUNCTION_ID.");
  }

  const execution = await functions.createExecution({
    functionId: appwriteConfig.cloudinarySignFunctionId,
    async: false,
    method: ExecutionMethod.POST,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ folder }),
  });

  const status = execution.responseStatusCode ?? 500;
  if (status < 200 || status >= 300) {
    throw new Error("Nem sikerült lekérni a Cloudinary aláírást.");
  }

  const data = parseExecutionResponseBody(execution.responseBody);
  const timestamp = Number(data.timestamp);
  const signature = String(data.signature ?? "");
  const resolvedFolder = String(data.folder ?? folder);

  if (!Number.isFinite(timestamp) || !signature) {
    throw new Error("Hibás Cloudinary aláírás válasz.");
  }

  return { timestamp, signature, folder: resolvedFolder };
};

export const uploadImageToCloudinarySigned = async ({
  uri,
  mimeType,
  fileName,
  folder = "items",
}: {
  uri: string;
  mimeType?: string;
  fileName?: string;
  folder?: string;
}) => {
  const apiKey = appwriteConfig.cloudinaryApiKey;
  const cloudName = appwriteConfig.cloudinaryCloudName;

  if (!apiKey) throw new Error("Hiányzik az EXPO_PUBLIC_CLOUDINARY_KEY.");
  if (!cloudName) throw new Error("Hiányzik az EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME.");

  const { timestamp, signature, folder: signedFolder } =
    await getCloudinarySignedUploadPayload(folder);

  const effectiveFileName = fileName || `item-${Date.now()}.jpg`;
  const effectiveMimeType = mimeType || "image/jpeg";

  const form = new FormData();
  form.append("file", {
    uri,
    name: effectiveFileName,
    type: effectiveMimeType,
  } as any);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", signedFolder || folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: form,
    }
  );

  const result = (await response.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !result.secure_url) {
    throw new Error(
      result?.error?.message || "Nem sikerült feltölteni a képet Cloudinary-re."
    );
  }

  return result.secure_url;
};

