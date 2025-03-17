/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'orderBy',
})
export class OrderByPipe implements PipeTransform {
  transform<T>(
    array: T[],
    field: string,
    order: 'asc' | 'desc' = 'asc',
  ): any[] {
    if (!array || array.length === 0 || !field) {
      return array; // Return the original array if no sorting is required
    }

    const sortedArray = [...array].sort((a, b) => {
      const valueA = this.resolveField(a, field);
      const valueB = this.resolveField(b, field);

      if (valueA < valueB) {
        return order === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sortedArray;
  }

  // Helper function to resolve nested fields like 'user.name'
  private resolveField(obj: any, field: string): any {
    return field.split('.').reduce((value, key) => value?.[key], obj);
  }
}
