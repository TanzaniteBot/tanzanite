import { DataTypes, type Model } from 'sequelize';

export function jsonParseGet(this: Model, key: string): any {
	return JSON.parse(this.getDataValue(key));
}
export function jsonParseSet(this: Model, key: string, value: any): any {
	return this.setDataValue(key, JSON.stringify(value));
}

export function jsonObject(key: string): any {
	return {
		type: DataTypes.TEXT,
		get: function (): Record<string, unknown> {
			return jsonParseGet.call(this, key);
		},
		set: function (val: Record<string, unknown>) {
			return jsonParseSet.call(this, key, val);
		},
		allowNull: false,
		defaultValue: '{}'
	};
}

export function jsonArray(key: string): any {
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

export function jsonBoolean(key: string, defaultVal = false): any {
	return {
		type: DataTypes.STRING,
		get: function (): boolean {
			return jsonParseGet.call(this, key);
		},
		set: function (val: boolean) {
			return jsonParseSet.call(this, key, val);
		},
		allowNull: false,
		defaultValue: `${defaultVal}`
	};
}

export function jsonBigint(key: string, defaultVal = 0n): any {
	return {
		type: DataTypes.TEXT,
		get: function (): bigint {
			return BigInt(this.getDataValue(key));
		},
		set: function (val: bigint) {
			return this.setDataValue(key, `${val}`);
		},
		allowNull: false,
		defaultValue: `${defaultVal}`
	};
}
