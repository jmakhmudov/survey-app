"""
Permit to import everything from survey.models without knowing the details.
"""

from .client import Client, Branch

__all__ = ["Client", "Branch"]
