import { DataTypes, Model } from 'sequelize';

export const NEVER_USED = 'This should never be executed';
function jsonParseGet(key: string, that: Model): any {
	return JSON.parse(that.getDataValue(key));
}
function jsonParseSet(key: string, that: Model, value: any): any {
	return that.setDataValue(key, JSON.stringify(value));
}

export function jsonArrayInit(key: string): any {
	return {
		type: DataTypes.TEXT,
		get: function () {
			return jsonParseGet(key, this);
		},
		set: function (val: string[]) {
			return jsonParseSet(key, this, val);
		},
		allowNull: false,
		defaultValue: '[]'
	};
}
