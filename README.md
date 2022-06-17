## Openbook Templates

Templates in this repository will be displayed to users on the Playground. Each template must contain a `metadata.json` file, which contains some information about the template

Example:

```js
{
  "title": "",
  "author": "r",
  "category": "Business",
  "description": "",
  "production": true,
  "staging": true,
  "updatedAt": ""
}
```

Setting `production` to `true` will display the template on the production playground. Same thing for staging.

Setting updatedAt is not necessary, if not provided, it will use the last commit date
