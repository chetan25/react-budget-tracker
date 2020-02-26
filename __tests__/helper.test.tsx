import { formatCurrency } from 'Services/helper';

describe('Test the formatter function', () => {
    it('should return formatted currency', function () {
        expect(formatCurrency(40)).toBe('$40.00');
    });
});