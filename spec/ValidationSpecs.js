describe("model validation", function () {
	var f = JSON.stringify; // format objects in messages

	var ModelValidator = Backbone.validation.ModelValidator;
	var rules = Backbone.validation.rules;

	var createValidator = function (attributeRules) {
		return new ModelValidator({ attributeRules: attributeRules });
	};

	describe("model validation extension", function () {

		var BaseModel = Backbone.Model.extend(Backbone.validation.modelValidation);
		var TestModel = BaseModel.extend({
			attributeRules: {
				code: rules.length({ min: 2, max: 5, message: "Between 2 and 5" })
			},
			instanceRules: rules.check(function () { return false; })
		});
		var model;
		beforeEach(function () {
			model = new TestModel();
		});

		it("should trigger error if invalid attribute is set", function () {
			var validationResult = null;
			model.bind("error", function (m, r) {
				validationResult = r;
			});
			model.set({ code: "1" });
			expect(validationResult).not.toBeNull();
			var expectedResult = {
				isValid: false,
				results: [{ attr: "code", path: "code", errors: [{ message: "Between 2 and 5", key: "string-length"}]}]
			};
			expect(validationResult).toEqual(expectedResult);
		});

		it("should not trigger error if valid attribute set", function () {
			var errored = false;
			model.bind("error", function (m, r) {
				errored = true;
			});
			model.set({ code: "123" });
			expect(errored).toBeFalsy();
		});

	});

	describe("model validation", function () {

		beforeEach(function () {
			this.addMatchers({
				toBeValid: function () {
					var result = this.actual;
					this.message = function () {
						return "Expected model to be valid but result was as follows: \n" + f(result);
					};
					return result.isValid;
				},
				toBeInvalid: function () {
					var result = this.actual;
					this.message = function () {
						return "Expected model to be invalid but result was as follows: \n" + f(result);
					};
					return !result.isValid;
				}
			});

		});

		describe("when validating specific attrs", function () {

			var validator;

			beforeEach(function () {
				validator = createValidator({
					code: rules.length({ min: 2, max: 5, message: "Between 2 and 5" }),
					name: rules.length({ min: 2, max: 5, message: "Between 2 and 5" }),
					description: rules.notNull({ message: "Not null" })
				});
			});

			it("should be valid if single attr being tested is valid", function () {
				var result = validator.validateAttrs({ code: "123" });
				expect(result).toBeValid();
			});

			it("should be valid if all attrs being tested are valid", function () {
				var result = validator.validateAttrs({ code: "123", name: "123" });
				expect(result).toBeValid();
			});

			it("should be invalid if one of all attrs being tested is invalid", function () {
				var result = validator.validateAttrs({ code: "1", name: "123" });
				expect(result).toBeInvalid();
			});

			it("should describe each invalid attr", function () {
				var result = validator.validateAttrs({ code: "123", name: "1", description: null });
				expect(result.results).toEqual([
						{ attr: "name", path: "name", errors: [{ message: "Between 2 and 5", key: "string-length"}] },
						{ attr: "description", path: "description", errors: [{ message: "Not null", key: "not-null"}] }
					]);
			});

		});

		describe("when validating model instance", function () {

			var validator;

			beforeEach(function () {
				validator = createValidator({
					code: rules.length({ min: 2, max: 5, message: "Between 2 and 5" }),
					name: rules.length({ min: 2, max: 5, message: "Between 2 and 5" }),
					description: rules.notNull({ message: "Not null" })
				});
			});

			it("should be valid if single attr being tested is valid", function () {
				var result = validator.validateAttrs({ code: "123" });
				expect(result).toBeValid();
			});

			it("should be valid if all attrs being tested are valid", function () {
				var result = validator.validateAttrs({ code: "123", name: "123" });
				expect(result).toBeValid();
			});

			it("should be invalid if one of all attrs being tested is invalid", function () {
				var result = validator.validateAttrs({ code: "1", name: "123" });
				expect(result).toBeInvalid();
			});

			it("should describe each invalid attr", function () {
				var result = validator.validateAttrs({ code: "123", name: "1", description: null });
				expect(result.results).toEqual([
						{ attr: "name", path: "name", errors: [{ message: "Between 2 and 5", key: "string-length"}] },
						{ attr: "description", path: "description", errors: [{ message: "Not null", key: "not-null"}] }
					]);
			});

		});


		describe("TODO nested object validation", function () {

			var Person = Backbone.Model.extend();

			var dave, mary, validator;

			beforeEach(function () {
				validator = createValidator({
					spouse: rules.valid({})
				});

				dave = new Person({ firstName: "Dave", lastName: "Smith", gender: "male" });
				mary = new Person({ firstName: "Mary", lastName: "Smith", gender: "female", spouse: dave });
			});

			describe("when validating nested model", function () {

				beforeEach(function () {
					validator.attr("name").valid();
				});

			});


			describe("nested collections", function () {

			});
		});
	});




	describe("validation rules", function () {

		var TestModel = Backbone.Model.extend();

		var model, validator;

		var valid = function (value, description) {
			test(value, true, description);
		};

		var invalid = function (value, description) {
			test(value, false, description);
		};

		var test = function (val, shouldBeValid, description) {
			var values = _.isArray(val) ? val : [val];
			_.each(values, function (value) {
				var valueDescription;
				if (_.isNull(value)) {
					valueDescription = "null";
				}
				else if (_.isUndefined(value)) {
					valueDescription = "undefined";
				}
				else if (_.isString(value)) {
					valueDescription = "'" + value + "'";
				} else {
					valueDescription = value.toString();
				}
				if (description) {
					valueDescription += " - " + description + " - ";
				}
				var testDescription = valueDescription + " should" + (shouldBeValid ? "" : " not") + " be valid";
				it(testDescription, function () {
					if (shouldBeValid) {
						expect(value).toBeValid();
					} else {
						expect(value).toBeInvalid();
					}
				});

			});
		};

		beforeEach(function () {
			model = new TestModel();

			this.addMatchers({
				toBeValid: function () {
					model.set({ name: this.actual });
					var result = validator.validate(model);
					this.message = function () {
						return "Expected model to be valid but result was as follows: \n" + f(result);
					};
					return result.isValid;

				},
				toBeInvalid: function (expectedMessages) {
					model.set({ name: this.actual });
					var result = validator.validate(model);
					this.message = function () {
						var message = "Expected model to be invalid";
						if (expectedMessages) {
							message += " with messages: " + f(expectedMessages);
						}
						message += " but result was as follows: \n" + f(result);
						return message;
					};
					var messagesOk = true;
					if (expectedMessages) {
						if (result.results.length === 1) {
							var actualMessages = _.pluck(result.results[0].errors, "message");
							messagesOk = _.isEqual(actualMessages, expectedMessages);
						} else {
							messagesOk = false;
						}
					}
					return !result.isValid && messagesOk;
				}
			});
		});

		describe("object attr rules", function () {

			describe("not null", function () {

				beforeEach(function () {
					validator = createValidator({ name: rules.notNull() });
				});

				invalid(null);
				valid("Dave", "string value");
				valid(123, "number");

				it("should use default message", function () {
					expect(null).toBeInvalid(["Please supply a value"]);
				});
			});

			describe("not null - custom message", function () {

				beforeEach(function () {
					validator = createValidator({
						name: rules.notNull({ message: "Value please!" })
					});
				});

				it("should use default message", function () {
					expect(null).toBeInvalid(["Value please!"]);
				});
			});

			describe("range", function () {

				beforeEach(function () {
					validator = createValidator({
						name: rules.range({ values: ["male", "female"] })
					});
				});

				invalid(null);
				valid(["male", "female"], "specified value");
				invalid(["Male", "MALE", "pending", "tbc"], "unspecified value");
			});

			describe("range - ignore case", function () {

				beforeEach(function () {
					validator = createValidator({
						name: rules.range({ values: ["male", "female"], ignoreCase: true })
					});
				});

				valid(["male", "female", "MALE", "FEMALE"], "specified value");
				invalid(["pending", "tbc"], "unspecified value");
			});

		});

		describe("string attr rules", function () {

			describe("not blank", function () {
				beforeEach(function () {
					validator = createValidator({
						name: rules.notBlank()
					});
				});

				invalid(null);
				invalid(["", "   ", "\t\t"], "empty or whitespace only");
				valid(["Dave", 123]);
			});

			describe("length - min only", function () {

				beforeEach(function () {
					validator = createValidator({
						name: rules.length({ min: 2 })
					});
				});

				invalid([null, "", 1]);
				valid(["  ", "ab", 12]);
			});

			describe("length - max only", function () {

				beforeEach(function () {
					validator = createValidator({ name: rules.length({ max: 5 }) });
				});

				invalid([null, "      ", "askjdflaskdf", 123456]);
				valid(12345, "hello", "1", "");
			});

			describe("length - min only trimmed", function () {

				beforeEach(function () {
					validator = createValidator({ name: rules.length({ min: 2, trim: true }) });
				});

				invalid(["", "  ", "\t\t", "  A  "]);
				valid("ab", 12);
			});

			describe("length - min and max trimmed", function () {

				beforeEach(function () {
					validator = createValidator({
						name: rules.length({ min: 2, max: 5, trim: true })
					});
				});

				invalid(["", "  ", "\t\t", "  A  ", "     A", "A     ", "  AAAAAA  ", "     AAAAAAA", "AAAAAAA    "]);
				valid(["ab", "abc", "abcd", "abcde", "  AAAA   ", "AAAA   ", 12, 123, 1234, 12345]);
			});

			describe("custom check", function () {

				beforeEach(function () {
					validator = createValidator({
						name: rules.check(function (value, context) {
							return value.toString().indexOf("monkey") != -1;
						}, { message: "Needs to contain the word monkey" })
					});
				});

				invalid("asdf","not matching rule");
				valid("monkey man","matching rule");
			});
		});
	});


});