module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow unsafe Angular provider syntax',
			category: 'Best Practices',
			recommended: false,
		},
		schema: [], // no options
	},
	create(context) {
		return {
			ObjectExpression(node) {
				const propertyInfo = getPropertyInfo(node);
				const choicePart = getChoicePart(propertyInfo);
				const optionsPart = propertyInfo.multiProperty
					? `, { multi: ${getPropertyValueText(propertyInfo.multiProperty)} }`
					: '';
				if (choicePart) {
					context.report({
						node: node,
						message: `Use type-safe 'provide(${getPropertyValueText(propertyInfo.provideProperty, 'EXAMPLE')}${optionsPart}).${choicePart}' from '@shared/dependency-injection-interop' instead.`,
					});
				}
			},
		};
	},
};

function getChoicePart({
	provideProperty,
	useValueProperty,
	useExistingProperty,
	useFactoryProperty,
	useClassProperty,
	depsProperty,
}) {
	if (!provideProperty) return;
	if (useValueProperty) {
		return `useValue(${getPropertyValueText(useValueProperty, 'example')})`;
	}
	if (useClassProperty) {
		return `useClass(${getPropertyValueText(useClassProperty, 'Example')})`;
	}
	if (useFactoryProperty) {
		if (depsProperty) {
			return 'useFactory(() => new Example(inject(EXAMPLE)))';
		}
		return 'useFactory(() => example)';
	}
	if (useExistingProperty) {
		return `useExisting(${getPropertyValueText(useExistingProperty, 'EXAMPLE')})`;
	}
	if (depsProperty) {
		return 'useFactory(() => new Example(inject(EXAMPLE)))';
	}
}

function getPropertyInfo({ properties }) {
	return properties.reduce((properties, property) => {
		switch (property.key?.name) {
			case 'provide':
				return { ...properties, provideProperty: property };
			case 'useValue':
				return { ...properties, useValueProperty: property };
			case 'useExisting':
				return { ...properties, useExistingProperty: property };
			case 'useFactory':
				return { ...properties, useFactoryProperty: property };
			case 'useClass':
				return { ...properties, useClassProperty: property };
			case 'deps':
				return { ...properties, depsProperty: property };
			case 'multi':
				return { ...properties, multiProperty: property };
			default:
				return properties;
		}
	}, {});
}

// This is a simple implementation. More complex properties will require more logic.
function getPropertyValueText(property, fallback) {
	switch (property.value.type) {
		case 'Literal':
			return property.value.value;
		case 'Identifier':
			return property.value.name;
		default:
			return fallback;
	}
}
