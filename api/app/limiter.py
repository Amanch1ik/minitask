from slowapi import Limiter
from slowapi.util import get_remote_address

# A single in-memory limiter is fine for a single-instance deploy. In a multi-
# replica setup, point slowapi at Redis via `storage_uri`.
limiter = Limiter(key_func=get_remote_address, default_limits=[])
