module.exports = {
  '*.ts': ['eslint --fix'],
  '*.json': ['eslint --fix'],
  '*.{yaml,yml}': ['eslint --fix'],
  'example/*.{yaml,yml}': ['strong-config validate --config-root example'],
  '*.md': ['markdownlint --ignore CHANGELOG.md'],
  'example/development.yaml': ['strong-config check example/development.yaml'],
}
