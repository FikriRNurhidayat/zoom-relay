import { useEffect, useState } from "react";

function getItem(key, initialValue) {
  const storage = localStorage.getItem(key) || null;
  const savedValue = JSON.parse(storage);

  if (!!savedValue) return savedValue;

  return initialValue;
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => getItem(key, initialValue));

  useEffect(() => {
    setItem(key, value);
  }, [value]);

  return [value, setValue];
}
