rsync -az --delete \
      -e "ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=yes" \
      ./dist/ "$SSH_USER@$SSH_HOST:/var/www/fluent/"