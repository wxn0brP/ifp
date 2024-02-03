/**
 * A class for validating objects based on a schema.
 * @class
 */
class ShemaC{
	/**
	 * Create a new SchemaC instance.
	 * @constructor
	 * @param {Object} schema - The schema definition for validation.
	 */
	constructor(schema){
		this.schema = schema;
	}

	/**
	 * Validates an object against the defined schema.
	 *
	 * @param {Object} obj - The object to validate.
	 * @param {boolean} [log=false] - Indicates whether validation errors should be logged (default: false).
	 * @returns {Object|boolean} The validated object if it passes validation, or `false` if validation fails.
	 */
	valid(obj, log=false){
        if(!obj){
            if(log) console.log(`Obiekt jest wymagany.`);
            return;
        }
		for(let key in this.schema){
			const fieldSchema = this.schema[key];
			const fieldValue = obj[key];

			if(fieldSchema.required && fieldValue === undefined){
				if(log) console.log(`Pole '${key}' jest wymagane.`);
				return false;
			}

			if(fieldValue !== undefined && fieldSchema.type && typeof fieldValue !== fieldSchema.type){
				if(log) console.log(`Pole '${key}' musi być typu '${fieldSchema.type}'.`);
				return false;
			}

			if(fieldValue !== undefined && fieldSchema.valid && !fieldSchema.valid(fieldValue)){
				if(log) console.log(`Pole '${key}' nie spełnia określonej reguły walidacji.`);
				return false;
			}

			if(fieldValue !== undefined && fieldSchema.enum !== undefined && !fieldSchema.enum.includes(fieldValue)){
				if(log) console.log(`Pole '${key}' musi mieć jedną z dopuszczonych wartości: ${fieldSchema.enum.join(', ')}.`);
				return false;
			}

			if(fieldValue !== undefined && fieldSchema.pattern !== undefined && !fieldSchema.pattern.test(fieldValue)){
				if(log) console.log(`Pole '${key}' nie spełnia określonego wzorca.`);
				return false;
			}

			if(fieldValue === undefined && fieldSchema.default !== undefined){
				obj[key] = fieldSchema.default;
			}
		}

		return obj;
	}
}

module.exports = ShemaC;  