import { buildPaginatedResult } from '../dto/pagination.dto';

describe('Pagination Utility Unit Tests', () => {
  it('should correctly calculate totalPages, hasNextPage, and hasPrevPage', () => {
    const data = [{ id: '1' }, { id: '2' }];
    const result = buildPaginatedResult(data, 10, 1, 2);

    expect(result.data.length).toBe(2);
    expect(result.meta.total).toBe(10);
    expect(result.meta.totalPages).toBe(5);
    expect(result.meta.hasNextPage).toBe(true);
    expect(result.meta.hasPrevPage).toBe(false);
  });

  it('should handle last page correctly', () => {
    const data = [{ id: '9' }, { id: '10' }];
    const result = buildPaginatedResult(data, 10, 5, 2);

    expect(result.meta.hasNextPage).toBe(false);
    expect(result.meta.hasPrevPage).toBe(true);
  });
});
