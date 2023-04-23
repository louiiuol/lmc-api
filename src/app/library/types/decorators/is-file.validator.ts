import { ValidationOptions, registerDecorator } from 'class-validator';
type imageType = 'image/jpg' | 'image/png' | 'image/jpeg';
type documentType = 'application/pdf';
interface IsFileOptions {
  mime: (imageType | documentType)[];
}

export function IsFile(
  options: IsFileOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    return registerDecorator({
      name: 'isFile',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (
            value?.mimetype &&
            (options?.mime ?? []).includes(value?.mimetype)
          ) {
            return true;
          }
          return false;
        },
      },
    });
  };
}
