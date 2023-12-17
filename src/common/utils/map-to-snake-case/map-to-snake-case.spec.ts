import { mapToSnakeCase } from './map-to-snake-case';

describe('mapToSnakeCase', () => {
  it('should convert object keys to snake case', () => {
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      address: {
        streetName: 'Main Street',
        city: 'New York',
      },
    };

    const expected = {
      first_name: 'John',
      last_name: 'Doe',
      address: {
        street_name: 'Main Street',
        city: 'New York',
      },
    };

    const result = mapToSnakeCase(data);

    expect(result).toEqual(expected);
  });

  it('should return an empty object if input is null', () => {
    const data = null;
    const expected = {};

    const result = mapToSnakeCase(data);

    expect(result).toEqual(expected);
  });

  it('should return an empty object if input is undefined', () => {
    const data = undefined;
    const expected = {};

    const result = mapToSnakeCase(data);

    expect(result).toEqual(expected);
  });

  it('should convert nested object keys to snake case', () => {
    const data = {
      participants: [
        {
          firstName: 'John',
          lastName: 'Doe',
          address: {
            streetName: 'Main Street',
            city: 'New York',
          },
        },
      ],
    };

    const expected = {
      participants: [
        {
          first_name: 'John',
          last_name: 'Doe',
          address: {
            street_name: 'Main Street',
            city: 'New York',
          },
        },
      ],
    };

    const result = mapToSnakeCase(data);

    expect(result).toEqual(expected);
  });
});
