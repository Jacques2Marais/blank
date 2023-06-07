export default class CommonUtils {
    static objectKeysStartingWith(object, string) {
        let keys = [];

        for (let key in object) {
            if (key.startsWith(string)) {
                keys.push(key);
            }
        }

        return keys;
    }

    static arrayValuesStartingWith(array, string) {
        let values = [];

        for (let value of array) {
            if (value.startsWith(string)) {
                values.push(value);
            }
        }

        return values;
    }
}