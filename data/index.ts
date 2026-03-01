import { places } from './places';
import { hotels } from './hotels';
import { tours } from './tours';
import { guides } from './guides';
import { Item } from '@/types';

export const allItems: Item[] = [
  ...places,
  ...hotels,
  ...tours,
  ...guides,
];

export { places, hotels, tours, guides };
