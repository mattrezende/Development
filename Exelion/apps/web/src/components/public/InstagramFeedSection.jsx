import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Instagram, AlertCircle } from 'lucide-react';

const InstagramFeedSection = ({ username }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!username) return;

    const loadInstagramEmbed = () => {
      // If the script is already loaded, just process the embeds
      if (window.instgrm) {
        window.instgrm.Embeds.process();
        // Add a small delay to allow the iframe to render before hiding skeleton
        setTimeout(() => setIsLoaded(true), 1000);
        return;
      }

      // Otherwise, inject the script
      const script = document.createElement('script');
      script.src = '//www.instagram.com/embed.js';
      script.async = true;
      
      script.onload = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
          setTimeout(() => setIsLoaded(true), 1500);
        }
      };
      
      script.onerror = () => {
        console.error('Failed to load Instagram embed script');
        setHasError(true);
      };
      
      document.body.appendChild(script);
    };

    loadInstagramEmbed();
  }, [username]);

  if (!username) return null;

  if (hasError) {
    return (
      <div className="instagram-feed-container mb-12">
        <div className="instagram-feed-error">
          <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-semibold mb-1">Feed Indisponível</h3>
          <p className="text-sm opacity-90">Não foi possível carregar o feed do Instagram no momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="instagram-feed-container mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center shadow-sm">
          <Instagram className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Siga no Instagram</h2>
          <a 
            href={`https://www.instagram.com/${username}/`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            @{username}
          </a>
        </div>
      </div>
      
      {!isLoaded && (
        <div className="instagram-feed-loading">
          <Skeleton className="w-full max-w-md h-[500px] rounded-xl" />
        </div>
      )}
      
      <div className={`w-full flex justify-center ${!isLoaded ? 'hidden' : 'block'}`}>
        <blockquote 
          className="instagram-media" 
          data-instgrm-permalink={`https://www.instagram.com/${username}/`}
          data-instgrm-version="14"
        >
          <div style={{ padding: '16px' }}>
            <a 
              href={`https://www.instagram.com/${username}/`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#000', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontStyle: 'normal', fontWeight: 'normal', lineHeight: '17px', textDecoration: 'none', wordWrap: 'break-word' }}
            >
              Ver perfil de @{username} no Instagram
            </a>
          </div>
        </blockquote>
      </div>
    </div>
  );
};

export default InstagramFeedSection;