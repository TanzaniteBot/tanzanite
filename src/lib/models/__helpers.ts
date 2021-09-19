import { DataTypes, Model } from 'sequelize';

export const NEVER_USED = 'This should never be executed';
export function jsonParseGet(this: Model, key: string): any {
	return JSON.parse(this.getDataValue(key));
}
export function jsonParseSet(this: Model, key: string, value: any): any {
	return this.setDataValue(key, JSON.stringify(value));
}

export function jsonArrayInit(key: string): any {
	return {
		type: DataTypes.TEXT,
		get: function (): string[] {
			return jsonParseGet.call(this, key);
		},
		set: function (val: string[]) {
			return jsonParseSet.call(this, key, val);
		},
		allowNull: false,
		defaultValue: '[]'
	};
}
