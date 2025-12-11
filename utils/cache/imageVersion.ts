import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "CS_IMAGE_VERSION";

export async function getImageVersion() {
  const v = await AsyncStorage.getItem(KEY);
  return v ? Number(v) : 1;
}

export async function bumpImageVersion() {
  const v = await getImageVersion();
  const nv = v + 1;
  await AsyncStorage.setItem(KEY, String(nv));
  return nv;
}

export async function versionedImage(url: string) {
  const v = await getImageVersion();
  return `${url}?v=${v}`;
}
