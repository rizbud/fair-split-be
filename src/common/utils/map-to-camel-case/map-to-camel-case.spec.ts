import { mapToCamelCase } from './map-to-camel-case';

describe('mapToCamelCase', () => {
  it('should convert object keys to camel case', () => {
    const obj = {
      first_name: 'John',
      last_name: 'Doe',
      age: 30,
      address: {
        street_name: '123 Main St',
        city_name: 'New York',
      },
    };

    const expected = {
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      address: {
        streetName: '123 Main St',
        cityName: 'New York',
      },
    };

    const result = mapToCamelCase(obj);

    expect(result).toEqual(expected);
  });

  it('should handle arrays', () => {
    const obj = {
      users: [
        {
          first_name: 'John',
          last_name: 'Doe',
        },
        {
          first_name: 'Jane',
          last_name: 'Smith',
        },
      ],
    };

    const expected = {
      users: [
        {
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
        },
      ],
    };

    const result = mapToCamelCase(obj);

    expect(result).toEqual(expected);
  });

  it('should handle nested objects', () => {
    const obj = {
      user_info: {
        first_name: 'John',
        last_name: 'Doe',
        address_info: {
          street_name: '123 Main St',
          city_name: 'New York',
        },
      },
    };

    const expected = {
      userInfo: {
        firstName: 'John',
        lastName: 'Doe',
        addressInfo: {
          streetName: '123 Main St',
          cityName: 'New York',
        },
      },
    };

    const result = mapToCamelCase(obj);

    expect(result).toEqual(expected);
  });
});
