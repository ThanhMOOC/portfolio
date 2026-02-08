import os
from dotenv import load_dotenv
import cloudinary
import cloudinary.api
import cloudinary.search

# 1. Configuration
load_dotenv()

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

# 2. Service Class
class CloudinaryService:
    @staticmethod
    def _optimize_url(url: str) -> str:
        if '/upload/' in url:
            return url.replace('/upload/', '/upload/f_auto,q_auto/')
        return url

    @staticmethod
    def _paginate_search(expression, sort_by=None, max_results=100):
        all_resources = []
        next_cursor = None

        while True:
            search = cloudinary.search.Search()
            search.expression(expression)
            if sort_by:
                search.sort_by(*sort_by)
            search.max_results(max_results)
            if next_cursor:
                search.next_cursor(next_cursor)
            result = search.execute()
            all_resources.extend(result['resources'])
            next_cursor = result.get('next_cursor')
            if not next_cursor:
                break

        return all_resources

    @staticmethod
    def fetch_portfolio_tree():
        all_resources = CloudinaryService._paginate_search(
            'public_id:portfolio/*',
            sort_by=('public_id', 'asc'),
            max_results=100
        )

        tree = {}
        for r in all_resources:
            group = 'root'
            prefix = 'portfolio/'
            if r['public_id'].startswith(prefix):
                remainder = r['public_id'][len(prefix):]
                sub_parts = remainder.split('/')
                if len(sub_parts) > 1:
                    group = sub_parts[0]
            url = CloudinaryService._optimize_url(r['secure_url'])
            if group not in tree:
                tree[group] = []
            tree[group].append({
                'url': url,
                'display_name': r.get('context', {}).get('custom', {}).get('display_name', ''),
                'public_id': r['public_id'],
                'width': r['width'],
                'height': r['height']
            })
        return tree

    @staticmethod
    def fetch_background_image():
        try:
            search = cloudinary.search.Search()
            search.expression('folder:portfolio')
            search.max_results(100)
            result = search.execute()
            root_images = [
                r for r in result['resources']
                if '/' not in r['public_id'].replace('portfolio/', '')
            ]
            if root_images:
                r = root_images[0]
                url = CloudinaryService._optimize_url(r['secure_url'])
                return {
                    'url': url,
                    'display_name': r.get('context', {}).get('custom', {}).get('display_name', 'Background'),
                    'public_id': r['public_id'],
                    'width': r['width'],
                    'height': r['height']
                }
            raise Exception('No background image found in portfolio root folder')
        except Exception as error:
            print('fetch_background_image error:', error)
            raise

    @staticmethod
    def fetch_images_by_folder(folder_name):
        try:
            all_resources = CloudinaryService._paginate_search(
                f'folder:portfolio/{folder_name}',
                sort_by=('public_id', 'asc'),
                max_results=100
            )
            return [
                {
                    'url': CloudinaryService._optimize_url(r['secure_url']),
                    'display_name': r.get('context', {}).get('custom', {}).get('display_name', ''),
                    'public_id': r['public_id'],
                    'width': r['width'],
                    'height': r['height']
                }
                for r in all_resources
            ]
        except Exception as error:
            print(f'fetch_images_by_folder({folder_name}) error:', error)
            raise
